resource "aws_wafv2_web_acl" "this" {
  name  = "${var.environment}-waf"
  scope = "CLOUDFRONT"

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.environment}-waf"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "${var.environment}-waf"
  }
}
