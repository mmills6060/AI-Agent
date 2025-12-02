import Link from 'next/link'
import { DocsNav } from '@/components/docs/docs-nav'

export default function Deployment() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DocsNav />
          
          <main className="lg:col-span-3">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Deployment</h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground mb-6">
                The application is deployed on AWS ECS Fargate using Terraform for infrastructure as code and GitHub Actions for CI/CD.
              </p>

              <h2 className="text-3xl font-bold mb-6 mt-12">Infrastructure Components</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="font-semibold mb-2 text-sm">VPC & Networking</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• VPC with CIDR 10.0.0.0/16</li>
                      <li>• Public & private subnets</li>
                      <li>• NAT gateways for outbound traffic</li>
                      <li>• Internet gateway for public access</li>
                    </ul>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="font-semibold mb-2 text-sm">Load Balancing</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Application Load Balancer (ALB)</li>
                      <li>• Path-based routing</li>
                      <li>• Health checks on /health</li>
                      <li>• SSL/TLS termination ready</li>
                    </ul>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="font-semibold mb-2 text-sm">Container Services</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• ECS Cluster with Fargate</li>
                      <li>• ECR repositories for images</li>
                      <li>• Auto-scaling policies</li>
                      <li>• Task definitions</li>
                    </ul>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="font-semibold mb-2 text-sm">Observability</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• CloudWatch Log Groups</li>
                      <li>• Container insights</li>
                      <li>• Service metrics</li>
                      <li>• Secrets Manager for config</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 mt-12">Architecture Diagram</h2>
              <div className="bg-muted/50 p-6 rounded-lg font-mono text-xs overflow-x-auto mb-6">
                <pre className="text-foreground">
{`┌─────────────────────────────────────────────────────────────────────┐
│                           VPC (10.0.0.0/16)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Public Subnets                           │  │
│  │  ┌─────────────────┐              ┌─────────────────────────┐ │  │
│  │  │  NAT Gateway    │              │  Application Load       │ │  │
│  │  │  (AZ-1 & AZ-2)  │              │  Balancer (ALB)        │ │  │
│  │  └─────────────────┘              └─────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Private Subnets                          │  │
│  │  ┌───────────────┐              ┌───────────────────┐         │  │
│  │  │   Frontend    │              │  Backend Python   │         │  │
│  │  │   (Next.js)   │              │   (FastAPI)       │         │  │
│  │  │   :3000       │              │     :8000         │         │  │
│  │  └───────────────┘              └───────────────────┘         │  │
│  │                    ECS Fargate Tasks                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │     External Services         │
                    │  - MongoDB Atlas              │
                    │  - OpenAI API                 │
                    │  - Tavily API                 │
                    └───────────────────────────────┘`}
                </pre>
              </div>

              <h2 className="text-3xl font-bold mb-6 mt-12">CI/CD Pipeline</h2>
              <p className="text-muted-foreground mb-4">
                GitHub Actions automates the build and deployment process:
              </p>
              <div className="space-y-3">
                <div className="bg-muted/30 p-4 rounded-lg border border-l-4 border-l-primary">
                  <div className="font-semibold text-sm mb-2">1. Build Phase</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Checkout code from repository</li>
                    <li>• Login to AWS and ECR</li>
                    <li>• Build Docker images for frontend and backend</li>
                    <li>• Push images to ECR with commit SHA tag</li>
                  </ul>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border border-l-4 border-l-primary">
                  <div className="font-semibold text-sm mb-2">2. Deploy Phase</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Update ECS services with force new deployment</li>
                    <li>• Wait for services to reach stable state</li>
                    <li>• Health checks verify successful deployment</li>
                    <li>• Generate deployment summary</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 mt-12">Environment Variables</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <div className="font-semibold mb-3 text-sm">Frontend (Next.js)</div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NODE_ENV</span>
                      <span className="text-primary">production</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NEXT_PUBLIC_API_URL</span>
                      <span className="text-primary">ALB URL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NEXT_PUBLIC_PYTHON_API_URL</span>
                      <span className="text-primary">ALB URL</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <div className="font-semibold mb-3 text-sm">Backend (FastAPI)</div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">OPENAI_API_KEY</span>
                      <span className="text-primary">Secrets Manager</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TAVILY_API_KEY</span>
                      <span className="text-primary">Secrets Manager</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MONGODB_URI</span>
                      <span className="text-primary">Secrets Manager</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PORT</span>
                      <span className="text-primary">8000</span>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 mt-12">Deployment Commands</h2>
              <div className="space-y-4">
                <div>
                  <div className="font-semibold text-sm mb-2">Initial Infrastructure Setup</div>
                  <div className="bg-background/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre className="text-foreground">{`cd infrastructure/terraform
terraform init
terraform plan
terraform apply`}</pre>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-sm mb-2">Build and Push Images</div>
                  <div className="bg-background/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre className="text-foreground">{`# Login to ECR
aws ecr get-login-password --region us-east-1 | \\
  docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

# Build and push frontend
docker build -t <ecr-frontend-url>:latest ./packages/frontend
docker push <ecr-frontend-url>:latest

# Build and push backend
docker build -t <ecr-backend-url>:latest ./packages/backend
docker push <ecr-backend-url>:latest`}</pre>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-sm mb-2">Manual Deployment</div>
                  <div className="bg-background/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre className="text-foreground">{`aws ecs update-service \\
  --cluster ai-agent-prod-cluster \\
  --service ai-agent-prod-frontend \\
  --force-new-deployment

aws ecs update-service \\
  --cluster ai-agent-prod-cluster \\
  --service ai-agent-prod-backend-python \\
  --force-new-deployment`}</pre>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-sm mb-2">View Logs</div>
                  <div className="bg-background/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre className="text-foreground">{`# Frontend logs
aws logs tail /ecs/ai-agent-prod/frontend --follow

# Backend logs
aws logs tail /ecs/ai-agent-prod/backend-python --follow`}</pre>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 mt-12">URL Routing</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Path Pattern</th>
                      <th className="text-left py-3 px-4 font-semibold">Target</th>
                      <th className="text-left py-3 px-4 font-semibold">Port</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-mono text-xs">/</td>
                      <td className="py-3 px-4">Frontend (Next.js)</td>
                      <td className="py-3 px-4 font-mono text-xs">3000</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-mono text-xs">/api/chat</td>
                      <td className="py-3 px-4">Backend (FastAPI)</td>
                      <td className="py-3 px-4 font-mono text-xs">8000</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-mono text-xs">/api/*</td>
                      <td className="py-3 px-4">Backend (FastAPI)</td>
                      <td className="py-3 px-4 font-mono text-xs">8000</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-mono text-xs">/docs</td>
                      <td className="py-3 px-4">Backend API Docs (Swagger)</td>
                      <td className="py-3 px-4 font-mono text-xs">8000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-12 flex gap-4">
                <Link
                  href="/docs/database"
                  className="inline-flex items-center text-muted-foreground hover:text-primary"
                >
                  ← Previous: Database Schema
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

