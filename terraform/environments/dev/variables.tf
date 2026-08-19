variable "dev_vpc_cidr" {
  type = string
}

variable "dev_public_cidr" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "environment" {
  type = string
}


variable "vpc_cidr" {
  type = string
}


variable "public_subnet_cidrs" {
  type = list(string)
}


variable "private_subnet_cidrs" {
  type = list(string)
}


variable "availability_zones" {
  type = list(string)
}


variable "db_username" {
  type      = string
  sensitive = true
}


variable "db_password" {
  type      = string
  sensitive = true
}
