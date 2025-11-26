output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_url" {
  description = "Application URL"
  value       = "http://${aws_lb.main.dns_name}"
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for frontend"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_node_repository_url" {
  description = "ECR repository URL for Node.js backend"
  value       = aws_ecr_repository.backend_node.repository_url
}

output "ecr_backend_python_repository_url" {
  description = "ECR repository URL for Python backend"
  value       = aws_ecr_repository.backend_python.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "frontend_service_name" {
  description = "Frontend ECS service name"
  value       = aws_ecs_service.frontend.name
}

output "backend_node_service_name" {
  description = "Node.js backend ECS service name"
  value       = aws_ecs_service.backend_node.name
}

output "backend_python_service_name" {
  description = "Python backend ECS service name"
  value       = aws_ecs_service.backend_python.name
}

output "cloudwatch_log_groups" {
  description = "CloudWatch log groups for services"
  value = {
    frontend       = aws_cloudwatch_log_group.frontend.name
    backend_node   = aws_cloudwatch_log_group.backend_node.name
    backend_python = aws_cloudwatch_log_group.backend_python.name
  }
}

