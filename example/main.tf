provider "google" {
  credentials = file("fluentci-086b644d4c53.json")
  project     = "fluentci"
  region      = "us-east1"
}

resource "google_storage_bucket" "my-bucket" {
  name          = "my-bucket"
  location      = "US"
  force_destroy = true
}

output "bucketName" {
  value = google_storage_bucket.my-bucket.url
}