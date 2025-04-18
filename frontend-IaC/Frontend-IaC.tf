terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}


# S3 Bucket for Static Website Hosting
resource "aws_s3_bucket" "mybucket" {
  bucket = "capstone-lms-bucket"
  tags = {
    Name        = "capstone-lms-bucket"
    Environment = "capstone-lms"
  }
}

# S3 Bucket Website Configuration
resource "aws_s3_bucket_website_configuration" "mybucket_website" {
  bucket = aws_s3_bucket.mybucket.id

  index_document {
    suffix = "index.html"    #updated to index.html
  }

  error_document {
    key = "error.html"
  }
}

# Public Access Block (Disabled for Public Bucket)
resource "aws_s3_bucket_public_access_block" "mybucket" {
  bucket = aws_s3_bucket.mybucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Ownership Controls
resource "aws_s3_bucket_ownership_controls" "mybucket" {
  bucket = aws_s3_bucket.mybucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "mybucket" {
  bucket = aws_s3_bucket.mybucket.id

  acl = "public-read"
  depends_on = [
    aws_s3_bucket_ownership_controls.mybucket,
    aws_s3_bucket_public_access_block.mybucket
  ]
}

locals {
  s3_origin_id = "myS3Origin"
}

# Define the CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "my_oai" {
  comment = "OAI for S3 bucket access"
}

# Update the S3 Bucket Policy to allow access from CloudFront OAI
resource "aws_s3_bucket_policy" "mybucket" {
  bucket = aws_s3_bucket.mybucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.my_oai.iam_arn
        }
        Action    = "s3:GetObject"
        Resource = [
          "${aws_s3_bucket.mybucket.arn}/*"
        ]
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.mybucket
  ]
}

# CloudFront Distribution for CDN
resource "aws_cloudfront_distribution" "mycdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN for static website"
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.mybucket.bucket_regional_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.my_oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    #viewer_protocol_policy = "redirect-to-https"
    viewer_protocol_policy = "allow-all"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "chawla-lab5-cdn"
    Environment = "Lab5"
  }
}

# Outputs
output "bucket_name" {
  value = aws_s3_bucket.mybucket.bucket
}

output "bucket_website_endpoint" {
  value = aws_s3_bucket.mybucket.bucket_regional_domain_name
}

output "cloudfront_distribution_domain_name" {
  value = aws_cloudfront_distribution.mycdn.domain_name
}