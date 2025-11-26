# AWS Infrastructure for AI Agent

This directory contains Terraform configurations for deploying the AI Agent application to AWS ECS (Elastic Container Service).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           VPC (10.0.0.0/16)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Public Subnets                           │  │
│  │  ┌─────────────────┐              ┌─────────────────────────┐ │  │
│  │  │  NAT Gateway    │              │  Application Load       │ │  │
│  │  │  (AZ-1)         │              │  Balancer (ALB)        │ │  │
│  │  └─────────────────┘              └─────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Private Subnets                          │  │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐   │  │
│  │  │   Frontend    │ │ Backend Node  │ │  Backend Python   │   │  │
│  │  │   (Next.js)   │ │  (Express)    │ │   (FastAPI)       │   │  │
│  │  │   :3000       │ │    :3001      │ │     :8000         │   │  │
│  │  └───────────────┘ └───────────────┘ └───────────────────┘   │  │
│  │                         ECS Fargate                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │     External Services         │
                    │  - Supabase (PostgreSQL)      │
                    │  - MongoDB Atlas              │
                    │  - OpenAI API                 │
                    │  - Tavily API                 │
                    └───────────────────────────────┘
```

## Components Created

- **VPC** with public and private subnets across 2 availability zones
- **NAT Gateways** for outbound internet access from private subnets
- **Application Load Balancer** with path-based routing
- **ECR Repositories** for container images
- **ECS Cluster** with Fargate capacity provider
- **ECS Services** for frontend, backend-node, and backend-python
- **Secrets Manager** for sensitive configuration
- **CloudWatch Log Groups** for container logs
- **Security Groups** for ALB and ECS tasks

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **Docker** for building container images locally

## Quick Start

### 1. Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

### 2. Create secrets file

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your actual values
```

Or use environment variables:

```bash
export TF_VAR_openai_api_key="your-openai-key"
export TF_VAR_tavily_api_key="your-tavily-key"
export TF_VAR_mongodb_uri="mongodb+srv://..."
export TF_VAR_supabase_url="https://xxx.supabase.co"
export TF_VAR_supabase_service_key="your-service-key"
```

### 3. Plan and Apply

```bash
# Preview changes
terraform plan

# Apply changes
terraform apply
```

### 4. Build and Push Container Images

After Terraform creates the ECR repositories, build and push your images:

```bash
# Get ECR repository URLs from Terraform output
terraform output ecr_frontend_repository_url
terraform output ecr_backend_node_repository_url
terraform output ecr_backend_python_repository_url

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push frontend
cd ../../packages/frontend
docker build -t <frontend-ecr-url>:latest .
docker push <frontend-ecr-url>:latest

# Build and push backend-node
cd ../backend
docker build -t <backend-node-ecr-url>:latest .
docker push <backend-node-ecr-url>:latest

# Build and push backend-python
cd ../backend-python
docker build -t <backend-python-ecr-url>:latest .
docker push <backend-python-ecr-url>:latest
```

### 5. Access Your Application

```bash
terraform output alb_url
```

## URL Routing

The Application Load Balancer routes traffic based on path:

| Path Pattern | Target |
|--------------|--------|
| `/` (default) | Frontend (Next.js) |
| `/api/*` | Backend Node (Express) |
| `/api-docs*` | Backend Node (Swagger) |
| `/agent/*` | Backend Python (FastAPI) |
| `/agent-api/*` | Backend Python (FastAPI) |

## Environment Variables

### Frontend
- `NODE_ENV` - production
- `NEXT_PUBLIC_API_URL` - Backend Node URL
- `NEXT_PUBLIC_PYTHON_API_URL` - Backend Python URL

### Backend Node
- `NODE_ENV` - production
- `PORT` - 3001
- `OPENAI_API_KEY` - From Secrets Manager
- `SUPABASE_URL` - From Secrets Manager
- `SUPABASE_SERVICE_KEY` - From Secrets Manager

### Backend Python
- `HOST` - 0.0.0.0
- `PORT` - 8000
- `DEBUG` - false
- `OPENAI_API_KEY` - From Secrets Manager
- `TAVILY_API_KEY` - From Secrets Manager
- `MONGODB_URI` - From Secrets Manager
- `MONGODB_DATABASE` - From Secrets Manager

## Scaling

Adjust the desired count variables in `terraform.tfvars`:

```hcl
frontend_desired_count       = 2
backend_node_desired_count   = 2
backend_python_desired_count = 2
```

Or scale manually via AWS CLI:

```bash
aws ecs update-service \
  --cluster ai-agent-prod-cluster \
  --service ai-agent-prod-frontend \
  --desired-count 3
```

## Monitoring

### View Logs

```bash
# Frontend logs
aws logs tail /ecs/ai-agent-prod/frontend --follow

# Backend Node logs
aws logs tail /ecs/ai-agent-prod/backend-node --follow

# Backend Python logs
aws logs tail /ecs/ai-agent-prod/backend-python --follow
```

### Check Service Status

```bash
aws ecs describe-services \
  --cluster ai-agent-prod-cluster \
  --services ai-agent-prod-frontend ai-agent-prod-backend-node ai-agent-prod-backend-python
```

## Cost Optimization

For development/staging environments:

1. Use Fargate Spot for non-critical workloads
2. Reduce desired count to 1
3. Use smaller CPU/memory configurations
4. Consider using a single NAT Gateway

## Clean Up

```bash
# Destroy all resources
terraform destroy
```

**Note:** Empty ECR repositories before destroying if you have images pushed.

## Troubleshooting

### Task fails to start
1. Check CloudWatch logs for error messages
2. Verify secrets are correctly configured in Secrets Manager
3. Ensure container images exist in ECR

### Health checks failing
1. Verify the health check endpoints return 200 OK
2. Check security group rules allow traffic on correct ports
3. Review task definition port mappings

### Connectivity issues
1. Verify NAT Gateway is running
2. Check route table associations
3. Review security group ingress/egress rules

