module "vpc" {
  source = "../../modules/vpc"

  environment = var.environment

  vpc_cidr = var.vpc_cidr

  availability_zones = [
    "us-east-1a",
    "us-east-1b"
  ]

  public_subnet_cidrs = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ]

  private_subnet_cidrs = [
    "10.0.11.0/24",
    "10.0.12.0/24"
  ]
}


module "security_groups" {
  source = "../../modules/security-groups"

  vpc_id      = module.vpc.vpc_id
  environment = "dev"
}

module "ecr" {
  source = "../../modules/ecr"

  repository_name = "dev-api"
  environment     = "dev"
}

module "rds" {

  source = "../../modules/rds"

  db_name = "ecommerce"

  username = "postgres"

  password = "Password123!"

  private_subnet_ids = module.vpc.private_subnet_ids

  security_group_ids = [
    module.security_groups.rds_security_group_id
  ]

  environment = "dev"

}

module "alb" {
  source = "../../modules/alb"

  environment = "dev"

  public_subnet_ids = module.vpc.public_subnet_ids

  security_group_ids = [
    module.security_groups.alb_security_group_id
  ]
}

module "ecs" {
  source = "../../modules/ecs"

  environment = "dev"
}

module "s3" {
  source = "../../modules/s3"

  environment = "dev"
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  bucket_domain_name = module.s3.bucket_regional_domain_name
}

module "waf" {
  source = "../../modules/waf"

  environment = "dev"
}

module "ec2" {
  source = "../../modules/ec2"

  ami_id        = "ami-052355af2a014bd2c"
  instance_type = "t3.micro"

  subnet_id = module.vpc.public_subnet_ids[0]

  security_group_ids = [
    module.security_groups.alb_security_group_id
  ]

  key_name = "mykey"

  instance_name = "dev-batch-server"

  environment = "dev"
}
