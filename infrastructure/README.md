# AI-Agent AWS Infrastructure

This directory contains Terraform configurations for deploying the AI-Agent application to AWS using ECS (Elastic Container Service) with Fargate.

## Architecture Overview

```
                    ┌─────────────────────────────────────────────────────┐
                    │                      AWS VPC                         │
                    │                                                      │
┌──────────┐       │  ┌─────────────────────────────────────────────────┐ │
│          │       │  │              Application Load Balancer          │ │
│ Internet │◄─────►│  │                   (Port 80/443)                 │ │
│          │       │  └─────────────────┬───────────────┬───────────────┘ │
└──────────┘       │                    │               │                 │
                    │                    ▼               ▼                 │
                    │  ┌─────────────────────┐ ┌─────────────────────────┐│
                    │  │   Frontend Service  │ │    Backend Service      ││
                    │  │   (Next.js :3000)   │ │   (FastAPI :8000)       ││
                    │  │                     │ │                         ││
                    │  │  ┌───────────────┐  │ │  ┌───────────────────┐  ││
                    │  │  │ ECS Fargate   │  │ │  │   ECS Fargate     │  ││
                    │  │  │    Task       │  │ │  │      Task         │  ││
                    │  │  └───────────────┘  │ │  └───────────────────┘  ││
                    │  └─────────────────────┘ └─────────────────────────┘│
                    │                                                      │
                    │  ┌─────────────────────┐ ┌─────────────────────────┐│
                    │  │   ECR Repository    │ │    ECR Repository       ││
                    │  │     (Frontend)      │ │      (Backend)          ││
                    │  └─────────────────────┘ └─────────────────────────┘│
                    └─────────────────────────────────────────────────────┘
```

## Prerequisites

1. **AWS CLI** installed and configured with appropriate credentials
2. **Terraform** v1.0 or later installed
3. **Docker** installed for building container images
4. AWS Secrets Manager secrets created for API keys

## Quick Start

### 1. Create AWS Secrets

First, create the required secrets in AWS Secrets Manager:

```bash
# OpenAI API Key
aws secretsmanager create-secret \
  --name ai-agent/openai-api-key \
  --secret-string "sk-your-openai-key"

# Tavily API Key
aws secretsmanager create-secret \
  --name ai-agent/tavily-api-key \
  --secret-string "tvly-your-tavily-key"

# MongoDB URI
aws secretsmanager create-secret \
  --name ai-agent/mongodb-uri \
  --secret-string "mongodb+srv://user:pass@cluster.mongodb.net"
```

### 2. Configure Terraform

```bash
cd infrastructure/terraform

# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
# Update the secret ARNs and other configuration
```

### 3. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply
```

### 4. Build and Push Docker Images

After the infrastructure is created, build and push your container images:

```bash
# Get ECR login credentials
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push frontend
docker build -t YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-agent-dev-frontend:latest ./packages/frontend
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-agent-dev-frontend:latest

# Build and push backend
docker build -t YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-agent-dev-backend:latest ./packages/backend
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-agent-dev-backend:latest
```

### 5. Force ECS Deployment

```bash
# Deploy new images
aws ecs update-service --cluster ai-agent-dev-cluster --service ai-agent-dev-frontend --force-new-deployment
aws ecs update-service --cluster ai-agent-dev-cluster --service ai-agent-dev-backend --force-new-deployment
```

## Configuration Options

### Cost Optimization

For development/testing, use these settings to minimize costs:

```hcl
enable_nat_gateway        = false  # Uses public subnets instead
enable_container_insights = false  # Disable CloudWatch insights
enable_autoscaling        = false  # Fixed number of tasks
use_fargate_spot          = true   # Up to 70% cost savings
frontend_cpu              = 256    # Minimum CPU
frontend_memory           = 512    # Minimum memory
backend_cpu               = 256
backend_memory            = 512
frontend_desired_count    = 1
backend_desired_count     = 1
```

### Production Settings

For production workloads:

```hcl
environment               = "production"
enable_nat_gateway        = true   # Enhanced security
enable_container_insights = true   # Full monitoring
enable_autoscaling        = true   # Handle traffic spikes
use_fargate_spot          = false  # Reliable capacity
frontend_cpu              = 512
frontend_memory           = 1024
backend_cpu               = 1024
backend_memory            = 2048
frontend_desired_count    = 2      # High availability
backend_desired_count     = 2
```

## Estimated Costs

| Component | Dev (min) | Production |
|-----------|-----------|------------|
| ALB | ~$16/month | ~$16/month |
| ECS Fargate (frontend) | ~$10/month | ~$40/month |
| ECS Fargate (backend) | ~$15/month | ~$60/month |
| NAT Gateway | $0 | ~$32/month |
| CloudWatch Logs | ~$1/month | ~$5/month |
| **Total** | **~$42/month** | **~$153/month** |

*Using Fargate Spot can reduce compute costs by up to 70%*

## File Structure

```
infrastructure/terraform/
├── main.tf                  # Main Terraform configuration
├── variables.tf             # Variable definitions
├── outputs.tf              # Output values
├── terraform.tfvars.example # Example variable values
└── README.md               # This file
```

## Terraform Outputs

After applying, Terraform will output useful information:

- `application_url` - URL to access the application
- `api_url` - URL for the backend API
- `frontend_ecr_repository_url` - ECR URL for frontend images
- `backend_ecr_repository_url` - ECR URL for backend images
- `ecr_login_command` - Command to authenticate with ECR
- `update_services_command` - Command to force new deployments

## Troubleshooting

### ECS Tasks Not Starting

1. Check CloudWatch logs:
   ```bash
   aws logs tail /ecs/ai-agent-dev/frontend --follow
   aws logs tail /ecs/ai-agent-dev/backend --follow
   ```

2. Verify secrets are accessible:
   ```bash
   aws secretsmanager get-secret-value --secret-id ai-agent/openai-api-key
   ```

3. Check ECS task status:
   ```bash
   aws ecs describe-tasks --cluster ai-agent-dev-cluster --tasks $(aws ecs list-tasks --cluster ai-agent-dev-cluster --query 'taskArns[0]' --output text)
   ```

### Health Checks Failing

1. Ensure your containers expose the correct health check endpoints:
   - Frontend: `GET /` returns 200-399
   - Backend: `GET /health` returns 200

2. Check security group rules allow traffic from ALB

### Image Push Failures

1. Ensure Docker is authenticated with ECR
2. Verify IAM permissions include ECR push access
3. Check image size doesn't exceed limits

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete all resources including the ECS cluster, ECR repositories (and images), and networking components.

## Security Considerations

- Secrets are stored in AWS Secrets Manager, not in Terraform state
- ECS tasks use task roles with minimal permissions
- Security groups restrict traffic to necessary ports only
- ECR images are scanned on push for vulnerabilities
- For production, enable HTTPS with ACM certificates

