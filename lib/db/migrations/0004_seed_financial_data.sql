-- Seed data for validation rules
INSERT INTO validation_rules (id, name, category, rule_expression, error_message, severity, is_active) VALUES 
('age_dependency_consistency', 'Age vs Dependency Status Consistency', 'cross_field', 'age >= 24 AND fafsa_dependency_status = ''dependent''', 'Students 24+ are typically considered independent for financial aid', 'warning', true),
('international_residency_conflict', 'International Residency Conflict', 'cross_field', 'country != ''United States'' AND residency_status = ''in_state''', 'International students cannot have in-state residency status', 'error', true),
('tuition_reasonableness_community', 'Community College Tuition Range', 'sanity_check', 'school_type = ''community_college'' AND tuition_amount > 8000', 'Community college tuition above $8,000 is unusually high', 'warning', true),
('pell_income_eligibility', 'Pell Grant Income Eligibility', 'business_rule', 'family_income_range LIKE ''%150k%'' AND pell_eligible = true', 'Pell Grant eligibility unlikely with family income over $150k', 'warning', true)
;

-- Seed data for cost calculation templates
INSERT INTO cost_calculation_templates (id, name, description, applies_when, base_calculations, typical_ranges, is_active) VALUES 
('community_college_2yr', 'Community College (2-year)', 'Typical costs for 2-year community college programs', '{"school_type": "community_college", "education_level": "associates"}', '{"tuition_per_credit": 150, "fees": 500, "books": 1200}', '{"total_annual": {"min": 3000, "max": 8000}}', true),
('public_in_state_4yr', 'Public University (In-State)', 'In-state tuition for public 4-year universities', '{"school_type": "public", "residency_status": "in_state", "education_level": "undergraduate"}', '{"base_tuition": 12000, "fees": 1500}', '{"total_annual": {"min": 8000, "max": 25000}}', true),
('public_out_state_4yr', 'Public University (Out-of-State)', 'Out-of-state tuition for public universities', '{"school_type": "public", "residency_status": "out_of_state", "education_level": "undergraduate"}', '{"base_tuition": 28000, "fees": 1500}', '{"total_annual": {"min": 20000, "max": 50000}}', true),
('private_4yr', 'Private University', 'Typical private university costs', '{"school_type": "private", "education_level": "undergraduate"}', '{"base_tuition": 45000, "fees": 2000}', '{"total_annual": {"min": 30000, "max": 80000}}', true)
;

-- Seed data for goal categories
INSERT INTO goal_categories (name, conditional_rules, typical_range, display_order, is_active) VALUES
('Tuition', '{"requires": ["education_level", "school_type", "residency_status"]}', '{"min": 2000, "max": 70000}', 1, true),
('Room & Board', '{"requires": ["living_arrangement"]}', '{"min": 8000, "max": 20000}', 2, true),
('Books & Supplies', '{"applies_to": ["all_education_levels"]}', '{"min": 500, "max": 3000}', 3, true),
('Transportation', '{"conditional": "location_dependent"}', '{"min": 200, "max": 5000}', 4, true),
('Personal Expenses', '{"applies_to": ["all_students"]}', '{"min": 1000, "max": 4000}', 5, true),
('Technology', '{"conditional": "program_requires_technology"}', '{"min": 500, "max": 3000}', 6, true),
('Lab Fees', '{"applies_when": {"program_type": ["science", "engineering", "medical"]}}', '{"min": 200, "max": 2000}', 7, true)
;