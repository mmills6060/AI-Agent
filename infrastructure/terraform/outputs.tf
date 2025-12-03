# =============================================================================
# AI-Agent Terraform Outputs
# =============================================================================

# -----------------------------------------------------------------------------
# Application URLs
# -----------------------------------------------------------------------------

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "application_url" {
  description = "URL to access the application"
  value       = "http://${aws_lb.main.dns_name}"
}

output "api_url" {
  description = "URL to access the backend API"
  value       = "http://${aws_lb.main.dns_name}/api"
}

# -----------------------------------------------------------------------------
# ECR Repositories
# -----------------------------------------------------------------------------

output "frontend_ecr_repository_url" {
  description = "ECR repository URL for frontend images"
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_ecr_repository_url" {
  description = "ECR repository URL for backend images"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_registry_id" {
  description = "ECR registry ID"
  value       = aws_ecr_repository.frontend.registry_id
}

# -----------------------------------------------------------------------------
# ECS Cluster
# -----------------------------------------------------------------------------

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

output "frontend_service_name" {
  description = "Name of the frontend ECS service"
  value       = aws_ecs_service.frontend.name
}

output "backend_service_name" {
  description = "Name of the backend ECS service"
  value       = aws_ecs_service.backend.name
}

# -----------------------------------------------------------------------------
# Networking
# -----------------------------------------------------------------------------

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

# -----------------------------------------------------------------------------
# Security Groups
# -----------------------------------------------------------------------------

output "alb_security_group_id" {
  description = "Security group ID for the ALB"
  value       = aws_security_group.alb.id
}

output "frontend_security_group_id" {
  description = "Security group ID for the frontend ECS tasks"
  value       = aws_security_group.ecs_frontend.id
}

output "backend_security_group_id" {
  description = "Security group ID for the backend ECS tasks"
  value       = aws_security_group.ecs_backend.id
}

# -----------------------------------------------------------------------------
# CloudWatch Logs
# -----------------------------------------------------------------------------

output "frontend_log_group" {
  description = "CloudWatch log group for frontend"
  value       = aws_cloudwatch_log_group.frontend.name
}

output "backend_log_group" {
  description = "CloudWatch log group for backend"
  value       = aws_cloudwatch_log_group.backend.name
}

# -----------------------------------------------------------------------------
# Helpful Commands
# -----------------------------------------------------------------------------

output "ecr_login_command" {
  description = "Command to authenticate Docker with ECR"
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

output "push_frontend_image_commands" {
  description = "Commands to build and push frontend image"
  value       = <<-EOT
    # Build frontend image
    docker build -t ${aws_ecr_repository.frontend.repository_url}:latest ./packages/frontend
    
    # Push to ECR
    docker push ${aws_ecr_repository.frontend.repository_url}:latest
  EOT
}

output "push_backend_image_commands" {
  description = "Commands to build and push backend image"
  value       = <<-EOT
    # Build backend image
    docker build -t ${aws_ecr_repository.backend.repository_url}:latest ./packages/backend
    
    # Push to ECR
    docker push ${aws_ecr_repository.backend.repository_url}:latest
  EOT
}

output "update_services_command" {
  description = "Command to force new deployment of ECS services"
  value       = <<-EOT
    # Force new deployment of frontend
    aws ecs update-service --cluster ${aws_ecs_cluster.main.name} --service ${aws_ecs_service.frontend.name} --force-new-deployment
    
    # Force new deployment of backend
    aws ecs update-service --cluster ${aws_ecs_cluster.main.name} --service ${aws_ecs_service.backend.name} --force-new-deployment
  EOT
}

