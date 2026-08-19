resource "aws_s3_bucket" "this" {
  bucket = "${var.environment}-frontend-bucket-${random_string.suffix.result}"

  tags = {
    Name = "${var.environment}-frontend-bucket"
  }
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}
