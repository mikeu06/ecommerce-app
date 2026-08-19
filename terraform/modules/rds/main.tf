resource "aws_db_subnet_group" "this" {

  name = "${var.environment}-db-subnet-group"

  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.environment}-db-subnet-group"
  }

}

resource "aws_db_instance" "this" {

  identifier = "${var.environment}-postgres"

  engine = "postgres"

  instance_class = "db.t3.micro"

  allocated_storage = 20

  db_name = var.db_name

  username = var.username

  password = var.password

  db_subnet_group_name = aws_db_subnet_group.this.name

  vpc_security_group_ids = var.security_group_ids

  publicly_accessible = false

  multi_az = true

  storage_encrypted = true

  skip_final_snapshot = true

  tags = {

    Name = "${var.environment}-postgres"

  }

}
