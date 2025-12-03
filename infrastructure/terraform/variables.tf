# =============================================================================
# AI-Agent Terraform Variables
# =============================================================================

# -----------------------------------------------------------------------------
# General Configuration
# -----------------------------------------------------------------------------

variable "project_name" {
  description = "Name of the project used for resource naming"
  type        = string
  default     = "ai-agent"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, production)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

# -----------------------------------------------------------------------------
# Networking
# -----------------------------------------------------------------------------

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets (increases cost)"
  type        = bool
  default     = false
}

# -----------------------------------------------------------------------------
# Frontend Container Configuration
# -----------------------------------------------------------------------------

variable "frontend_container_port" {
  description = "Port the frontend container listens on"
  type        = number
  default     = 3000
}

variable "frontend_cpu" {
  description = "CPU units for frontend task (1024 = 1 vCPU)"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory (MB) for frontend task"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 1
}

variable "frontend_max_count" {
  description = "Maximum number of frontend tasks for auto-scaling"
  type        = number
  default     = 4
}

variable "frontend_image_tag" {
  description = "Docker image tag for frontend"
  type        = string
  default     = "latest"
}

# -----------------------------------------------------------------------------
# Backend Container Configuration
# -----------------------------------------------------------------------------

variable "backend_container_port" {
  description = "Port the backend container listens on"
  type        = number
  default     = 8000
}

variable "backend_cpu" {
  description = "CPU units for backend task (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory (MB) for backend task"
  type        = number
  default     = 1024
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 1
}

variable "backend_max_count" {
  description = "Maximum number of backend tasks for auto-scaling"
  type        = number
  default     = 4
}

variable "backend_image_tag" {
  description = "Docker image tag for backend"
  type        = string
  default     = "latest"
}

# -----------------------------------------------------------------------------
# Database Configuration
# -----------------------------------------------------------------------------

variable "mongodb_database" {
  description = "MongoDB database name"
  type        = string
  default     = "multi_agent_db"
}

# -----------------------------------------------------------------------------
# Secrets (AWS Secrets Manager ARNs)
# -----------------------------------------------------------------------------

variable "openai_api_key_secret_arn" {
  description = "ARN of the AWS Secrets Manager secret for OpenAI API key"
  type        = string
  default     = ""
}

variable "tavily_api_key_secret_arn" {
  description = "ARN of the AWS Secrets Manager secret for Tavily API key"
  type        = string
  default     = ""
}

variable "mongodb_uri_secret_arn" {
  description = "ARN of the AWS Secrets Manager secret for MongoDB URI"
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Feature Flags
# -----------------------------------------------------------------------------

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights for ECS cluster"
  type        = bool
  default     = false
}

variable "enable_autoscaling" {
  description = "Enable auto-scaling for ECS services"
  type        = bool
  default     = false
}

variable "use_fargate_spot" {
  description = "Use Fargate Spot for cost savings (may have interruptions)"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 14
}

