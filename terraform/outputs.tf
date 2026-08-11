output "ec2_public_ip" {
  description = "Public IP address of the deployed EC2 instance"
  value       = aws_instance.notes_api_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the deployed EC2 instance"
  value       = aws_instance.notes_api_server.public_dns
}

output "security_group_id" {
  description = "ID of the created security group"
  value       = aws_security_group.notes_api_sg.id
}
