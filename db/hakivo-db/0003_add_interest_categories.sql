-- Migration: Add interest categories for personalization
-- Purpose: Map Congress.gov policy areas to 12 citizen-friendly interest categories
-- Use cases: Personalized bills, news aggregation, audio briefings

-- Create interest categories table
CREATE TABLE IF NOT EXISTS interest_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  keywords TEXT NOT NULL,  -- JSON array of keywords for news matching
  policy_areas TEXT NOT NULL,  -- JSON array of Congress.gov policy areas
  color TEXT NOT NULL,  -- Tailwind color class for UI
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user interests junction table
CREATE TABLE IF NOT EXISTS user_interests (
  user_id TEXT NOT NULL,
  interest_category_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, interest_category_id),
  FOREIGN KEY (interest_category_id) REFERENCES interest_categories(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_category_id ON user_interests(interest_category_id);

-- Seed data: 12 interest categories with comprehensive keywords

-- 1. Economy & Jobs
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'economy-jobs',
  'Economy & Jobs',
  'Employment, wages, economic policy, and financial markets',
  '💼',
  '["jobs", "employment", "unemployment", "wages", "salary", "minimum wage", "economy", "recession", "GDP", "economic growth", "stock market", "inflation", "deflation", "interest rates", "Federal Reserve", "small business", "entrepreneurship", "corporations", "trade", "tariffs", "exports", "imports", "manufacturing", "labor unions", "workplace", "career", "hiring", "layoffs", "gig economy"]',
  '["Economics and Public Finance", "Labor and Employment", "Commerce", "Finance and Financial Sector"]',
  'blue'
);

-- 2. Healthcare
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'healthcare',
  'Healthcare',
  'Health insurance, medical care, and public health',
  '🏥',
  '["healthcare", "health care", "health insurance", "medicare", "medicaid", "affordable care act", "ACA", "Obamacare", "hospitals", "doctors", "physicians", "nurses", "prescription drugs", "drug prices", "pharmaceuticals", "mental health", "therapy", "counseling", "opioid", "addiction", "substance abuse", "vaccine", "vaccination", "immunization", "COVID", "coronavirus", "pandemic", "public health", "disease", "illness", "medical research", "clinical trials", "health coverage", "pre-existing conditions"]',
  '["Health"]',
  'red'
);

-- 3. Education
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'education',
  'Education',
  'Schools, colleges, student loans, and education policy',
  '📚',
  '["education", "schools", "teachers", "students", "college", "university", "higher education", "student loans", "student debt", "tuition", "financial aid", "scholarships", "Pell grants", "K-12", "elementary school", "high school", "charter schools", "public schools", "private schools", "homeschooling", "curriculum", "standardized testing", "SAT", "ACT", "graduation rates", "literacy", "STEM", "vocational training", "community college", "early childhood education", "preschool"]',
  '["Education"]',
  'yellow'
);

-- 4. Environment & Climate
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'environment-climate',
  'Environment & Climate',
  'Climate change, clean energy, and environmental protection',
  '🌍',
  '["environment", "climate change", "global warming", "greenhouse gas", "carbon emissions", "CO2", "fossil fuels", "renewable energy", "solar power", "wind power", "clean energy", "green energy", "electric vehicles", "EV", "pollution", "air quality", "water pollution", "conservation", "wildlife", "endangered species", "deforestation", "recycling", "sustainability", "Paris Agreement", "EPA", "environmental protection", "national parks", "public lands", "fracking", "oil drilling", "coal"]',
  '["Environmental Protection", "Energy", "Water Resources Development"]',
  'green'
);

-- 5. Safety & Justice
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'safety-justice',
  'Safety & Justice',
  'Crime, law enforcement, and emergency response',
  '⚖️',
  '["crime", "law enforcement", "police", "policing", "criminal justice", "justice system", "prison", "incarceration", "mass incarceration", "bail reform", "sentencing", "mandatory minimums", "death penalty", "capital punishment", "public safety", "911", "emergency services", "firefighters", "disaster response", "FEMA", "natural disasters", "hurricanes", "floods", "wildfires", "gun violence", "gun control", "second amendment", "background checks", "assault weapons", "school shootings", "domestic violence", "hate crimes", "drug enforcement"]',
  '["Crime and Law Enforcement", "Law", "Emergency Management"]',
  'purple'
);

-- 6. National Security
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'national-security',
  'National Security',
  'Defense, military, foreign policy, and international relations',
  '🛡️',
  '["national security", "defense", "military", "armed forces", "army", "navy", "air force", "marines", "veterans", "VA", "Department of Defense", "Pentagon", "NATO", "terrorism", "counterterrorism", "cybersecurity", "cyber attacks", "intelligence", "CIA", "FBI", "NSA", "foreign policy", "diplomacy", "international relations", "trade deals", "sanctions", "China", "Russia", "Middle East", "Afghanistan", "Iraq", "Iran", "North Korea", "nuclear weapons", "war", "conflict"]',
  '["Armed Forces and National Security", "International Affairs", "Foreign Trade and International Finance"]',
  'indigo'
);

-- 7. Civil Rights & Equality
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'civil-rights',
  'Civil Rights & Equality',
  'Voting rights, discrimination, and social justice',
  '✊',
  '["civil rights", "voting rights", "voter suppression", "gerrymandering", "discrimination", "racial justice", "racism", "police brutality", "Black Lives Matter", "systemic racism", "LGBTQ rights", "gay rights", "same-sex marriage", "transgender rights", "gender equality", "women''s rights", "equal pay", "sexual harassment", "Me Too", "reproductive rights", "abortion", "Roe v Wade", "immigration", "immigrants", "refugees", "asylum", "DACA", "dreamers", "border security", "ICE", "deportation", "citizenship", "Native American rights", "tribal sovereignty", "disability rights", "religious freedom"]',
  '["Civil Rights and Liberties, Minority Issues", "Immigration", "Native Americans"]',
  'pink'
);

-- 8. Housing & Transportation
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'housing-transportation',
  'Housing & Transportation',
  'Affordable housing, infrastructure, and public transit',
  '🏠',
  '["housing", "affordable housing", "rent", "rental assistance", "housing crisis", "homelessness", "unhoused", "mortgages", "foreclosure", "real estate", "zoning", "gentrification", "public housing", "Section 8", "HUD", "transportation", "infrastructure", "roads", "bridges", "highways", "public transit", "buses", "trains", "subway", "rail", "Amtrak", "airports", "ports", "transportation infrastructure", "commute", "traffic", "congestion", "urban planning", "cities", "rural areas"]',
  '["Housing and Community Development", "Transportation and Public Works"]',
  'orange'
);

-- 9. Technology & Science
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'technology-science',
  'Technology & Science',
  'Innovation, tech regulation, and scientific research',
  '💻',
  '["technology", "tech", "artificial intelligence", "AI", "machine learning", "social media", "Facebook", "Twitter", "TikTok", "big tech", "tech companies", "Silicon Valley", "privacy", "data privacy", "surveillance", "encryption", "net neutrality", "broadband", "internet access", "5G", "telecommunications", "FCC", "science", "scientific research", "NASA", "space exploration", "biotech", "biotechnology", "genetics", "CRISPR", "innovation", "patents", "intellectual property", "copyright", "R&D", "research funding", "NIH", "NSF"]',
  '["Science, Technology, Communications"]',
  'cyan'
);

-- 10. Agriculture & Food
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'agriculture-food',
  'Agriculture & Food',
  'Farming, food policy, and natural resources',
  '🌾',
  '["agriculture", "farming", "farmers", "ranchers", "livestock", "crops", "food", "food security", "food stamps", "SNAP", "nutrition", "farm bill", "agricultural subsidies", "crop insurance", "rural development", "rural America", "pesticides", "organic farming", "GMO", "genetically modified", "food safety", "FDA", "USDA", "forestry", "timber", "fishing", "fisheries", "national forests", "BLM", "Bureau of Land Management", "grazing", "mining", "natural resources", "resource management"]',
  '["Agriculture and Food", "Public Lands and Natural Resources"]',
  'lime'
);

-- 11. Family & Social Services
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'family-social',
  'Family & Social Services',
  'Child care, elder care, and social safety net programs',
  '👨‍👩‍👧‍👦',
  '["family", "child care", "childcare", "daycare", "parental leave", "paid leave", "family leave", "FMLA", "children", "kids", "foster care", "adoption", "child welfare", "child support", "elder care", "elderly", "seniors", "nursing homes", "assisted living", "social security", "retirement", "pension", "401k", "Medicare", "senior citizens", "AARP", "social services", "welfare", "poverty", "food insecurity", "hunger", "homeless services", "community services", "nonprofit", "charity", "volunteering", "sports", "recreation", "parks"]',
  '["Families", "Social Welfare", "Social Sciences and History", "Sports and Recreation"]',
  'rose'
);

-- 12. Government & Taxes
INSERT INTO interest_categories (id, name, description, icon, keywords, policy_areas, color) VALUES (
  'government-taxes',
  'Government & Taxes',
  'Government operations, elections, and tax policy',
  '🏛️',
  '["government", "Congress", "Senate", "House of Representatives", "legislation", "bills", "laws", "executive branch", "president", "White House", "federal government", "state government", "local government", "bureaucracy", "regulations", "government spending", "budget", "deficit", "national debt", "appropriations", "elections", "voting", "campaigns", "campaign finance", "dark money", "lobbying", "lobbyists", "corruption", "ethics", "taxes", "taxation", "tax reform", "tax cuts", "tax increases", "IRS", "income tax", "corporate tax", "capital gains", "estate tax", "property tax", "sales tax"]',
  '["Government Operations and Politics", "Taxation"]',
  'slate'
);
