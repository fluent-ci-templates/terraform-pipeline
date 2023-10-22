provider "google" {
  credentials = file("fluentci-086b644d4c53.json")
  project     = "fluentci"
  region      = "us-east1"
}

resource "google_storage_bucket" "my-fluentci-example-bucket" {
  name          = "my-fluentci-example-bucket"
  location      = "US"
  force_destroy = true
}

output "bucketName" {
  value = google_storage_bucket.my-fluentci-example-bucket.url
}

terraform {
  backend "gcs" {
    bucket = "fluentci-example-tf-state"
    prefix = "state/terraform.tfstate"
  }
}