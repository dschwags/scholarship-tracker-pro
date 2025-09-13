/**
 * Web Worker Manager for Clacky Financial Planning System
 * 
 * Manages worker threads for CPU-intensive operations like AI decision processing,
 * form validation, and data calculations to keep the UI responsive.
 */

// Import types from the threaded AI hook to avoid database dependencies
import type { AIFormContext, FieldUpdate } from '@/lib/hooks/use-threaded-ai';

interface WorkerTask {
  id: string;
  worker: Worker;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

interface WorkerPoolConfig {
  maxWorkers: number;
  taskTimeout: number;
}

export class WorkerManager {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private activeTests: Map<string, WorkerTask> = new Map();
  private config: WorkerPoolConfig;

  constructor(config: Partial<WorkerPoolConfig> = {}) {
    this.config = {
      maxWorkers: config.maxWorkers || Math.max(navigator.hardwareConcurrency || 4, 8), // At least 8 workers
      taskTimeout: config.taskTimeout || 15000 // 15 seconds (shorter timeout)
    };
    
    this.initializeWorkerPool();
  }

  /**
   * Initialize the worker pool
   */
  private initializeWorkerPool() {
    console.log(`🧵 Initializing ${this.config.maxWorkers} AI processing workers...`);
    
    for (let i = 0; i < this.config.maxWorkers; i++) {
      const worker = new Worker('/workers/ai-decision-worker.js');
      
      worker.onmessage = (event) => {
        this.handleWorkerMessage(worker, event);
      };
      
      worker.onerror = (error) => {
        console.error('🚨 Worker error:', error);
        this.handleWorkerError(worker, error);
      };
      
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  /**
   * Process field update using worker thread
   */
  async processFieldUpdate(
    fieldUpdate: FieldUpdate,
    context: AIFormContext,
    onProgress?: (progress: number) => void
  ): Promise<AIFormContext> {
    return this.executeWorkerTask('PROCESS_FIELD', {
      fieldUpdate,
      context
    }, onProgress);
  }

  /**
   * Validate entire form using worker thread
   */
  async validateForm(
    formData: Record<string, any>,
    context: AIFormContext,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    return this.executeWorkerTask('VALIDATE_FORM', {
      formData,
      context
    }, onProgress);
  }

  /**
   * Resolve conflicts using worker thread
   */
  async resolveConflicts(
    conflicts: any[],
    formData: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    return this.executeWorkerTask('RESOLVE_CONFLICTS', {
      conflicts,
      formData
    }, onProgress);
  }

  /**
   * Execute a task in an available worker
   */
  private async executeWorkerTask(
    type: string,
    payload: any,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.getAvailableWorker();
      if (!worker) {
        console.warn(`⚠️ No workers available. Pool stats: ${JSON.stringify(this.getStats())}`);
        reject(new Error('All workers are busy. Try again in a moment.'));
        return;
      }

      const taskId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Set up task tracking
      const task: WorkerTask = {
        id: taskId,
        worker,
        resolve,
        reject,
        onProgress
      };
      
      this.activeTests.set(taskId, task);
      
      // Set timeout
      const timeout = setTimeout(() => {
        this.handleTaskTimeout(taskId);
      }, this.config.taskTimeout);
      
      // Store timeout reference
      (task as any).timeout = timeout;
      
      // Send task to worker
      worker.postMessage({
        id: taskId,
        type,
        payload
      });
      
      console.log(`🚀 Dispatched ${type} task ${taskId} to worker`);
    });
  }

  /**
   * Get an available worker from the pool
   */
  private getAvailableWorker(): Worker | null {
    const worker = this.availableWorkers.pop();
    return worker || null;
  }

  /**
   * Return worker to available pool
   */
  private returnWorkerToPool(worker: Worker) {
    if (!this.availableWorkers.includes(worker)) {
      this.availableWorkers.push(worker);
    }
  }

  /**
   * Handle messages from workers
   */
  private handleWorkerMessage(worker: Worker, event: MessageEvent) {
    const { id, type, result, error, progress } = event.data;
    const task = this.activeTests.get(id);
    
    if (!task) {
      console.warn(`⚠️ Received message for unknown task: ${id}`);
      return;
    }

    switch (type) {
      case 'SUCCESS':
        console.log(`✅ Task ${id} completed successfully`);
        this.cleanupTask(id);
        task.resolve(result);
        break;
        
      case 'ERROR':
        console.error(`❌ Task ${id} failed:`, error);
        this.cleanupTask(id);
        task.reject(new Error(error));
        break;
        
      case 'PROGRESS':
        if (task.onProgress) {
          task.onProgress(progress);
        }
        break;
        
      default:
        console.warn(`⚠️ Unknown message type from worker: ${type}`);
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(worker: Worker, error: ErrorEvent) {
    console.error('🚨 Worker error:', error);
    
    // Find and fail all tasks using this worker
    for (const [taskId, task] of this.activeTests.entries()) {
      if (task.worker === worker) {
        this.cleanupTask(taskId);
        task.reject(new Error(`Worker error: ${error.message}`));
      }
    }
    
    // Replace the failed worker
    this.replaceWorker(worker);
  }

  /**
   * Handle task timeout
   */
  private handleTaskTimeout(taskId: string) {
    const task = this.activeTests.get(taskId);
    if (task) {
      console.error(`⏰ Task ${taskId} timed out`);
      this.cleanupTask(taskId);
      task.reject(new Error(`Task timeout after ${this.config.taskTimeout}ms`));
    }
  }

  /**
   * Clean up completed/failed task
   */
  private cleanupTask(taskId: string) {
    const task = this.activeTests.get(taskId);
    if (task) {
      // Clear timeout
      if ((task as any).timeout) {
        clearTimeout((task as any).timeout);
      }
      
      // Return worker to pool
      this.returnWorkerToPool(task.worker);
      
      // Remove from active tasks
      this.activeTests.delete(taskId);
    }
  }

  /**
   * Replace a failed worker
   */
  private replaceWorker(failedWorker: Worker) {
    console.log('🔄 Replacing failed worker...');
    
    // Remove from pools
    const workerIndex = this.workers.indexOf(failedWorker);
    if (workerIndex !== -1) {
      this.workers.splice(workerIndex, 1);
    }
    
    const availableIndex = this.availableWorkers.indexOf(failedWorker);
    if (availableIndex !== -1) {
      this.availableWorkers.splice(availableIndex, 1);
    }
    
    // Terminate the failed worker
    failedWorker.terminate();
    
    // Create replacement
    const newWorker = new Worker('/workers/ai-decision-worker.js');
    newWorker.onmessage = (event) => {
      this.handleWorkerMessage(newWorker, event);
    };
    newWorker.onerror = (error) => {
      this.handleWorkerError(newWorker, error);
    };
    
    this.workers.push(newWorker);
    this.availableWorkers.push(newWorker);
    
    console.log('✅ Worker replacement completed');
  }

  /**
   * Get worker pool statistics
   */
  getStats() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      activeTests: this.activeTests.size,
      maxWorkers: this.config.maxWorkers
    };
  }

  /**
   * Terminate all workers and cleanup
   */
  destroy() {
    console.log('🧹 Shutting down worker pool...');
    
    // Reject all pending tasks
    for (const [taskId, task] of this.activeTests.entries()) {
      task.reject(new Error('Worker pool is being destroyed'));
    }
    this.activeTests.clear();
    
    // Terminate all workers
    for (const worker of this.workers) {
      worker.terminate();
    }
    
    this.workers = [];
    this.availableWorkers = [];
    
    console.log('✅ Worker pool shutdown complete');
  }
}

// Singleton instance for global use
let globalWorkerManager: WorkerManager | null = null;

export function getWorkerManager(): WorkerManager {
  if (!globalWorkerManager) {
    globalWorkerManager = new WorkerManager();
  }
  return globalWorkerManager;
}

export function destroyWorkerManager() {
  if (globalWorkerManager) {
    globalWorkerManager.destroy();
    globalWorkerManager = null;
  }
}