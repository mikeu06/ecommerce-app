variable "vpc_id" {
  type        = string
  description = "ID of the VPC where the security groups will be created"
}

variable "environment" {
  type        = string
  description = "Environment name"
}
