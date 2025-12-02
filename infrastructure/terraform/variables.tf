variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "ai-agent"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# Container configurations
variable "frontend_cpu" {
  description = "CPU units for frontend container"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory for frontend container (MB)"
  type        = number
  default     = 512
}

variable "backend_python_cpu" {
  description = "CPU units for Python backend container"
  type        = number
  default     = 512
}

variable "backend_python_memory" {
  description = "Memory for Python backend container (MB)"
  type        = number
  default     = 1024
}

# Scaling configurations
variable "frontend_desired_count" {
  description = "Desired number of frontend containers"
  type        = number
  default     = 2
}

variable "backend_python_desired_count" {
  description = "Desired number of Python backend containers"
  type        = number
  default     = 2
}

# Secrets (to be provided via environment or tfvars)
variable "openai_api_key" {
  description = "OpenAI API Key"
  type        = string
  sensitive   = true
}

variable "tavily_api_key" {
  description = "Tavily API Key"
  type        = string
  sensitive   = true
}

variable "mongodb_uri" {
  description = "MongoDB connection URI"
  type        = string
  sensitive   = true
}

variable "mongodb_database" {
  description = "MongoDB database name"
  type        = string
  default     = "multi_agent_db"
}

variable "supabase_url" {
  description = "Supabase URL"
  type        = string
  sensitive   = true
}

variable "supabase_service_key" {
  description = "Supabase service key"
  type        = string
  sensitive   = true
}

