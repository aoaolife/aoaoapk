import os
import smtplib
import tarfile
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime

# Email Configuration
SMTP_SERVER = 'smtp.qq.com'
SMTP_PORT = 587
SMTP_USERNAME = 'focus.chen@qq.com'
SMTP_PASSWORD = 'boachzetfgxzcajh'
FROM_EMAIL = 'focus.chen@qq.com'
TO_EMAIL = 'focus.chen@qq.com'

def create_backup():
    """Compresses the current directory into a tar.gz file, excluding large folders."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f"aoaodatacenter_backup_{timestamp}.tar.gz"
    
    print(f"Creating backup: {backup_filename}...")
    
    with tarfile.open(backup_filename, "w:gz") as tar:
        for root, dirs, files in os.walk("."):
            # Exclude directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git', 'android', 'ios', 'venv', '__pycache__']]
            
            for file in files:
                if file != backup_filename and not file.endswith('.apk'):
                    file_path = os.path.join(root, file)
                    tar.add(file_path, arcname=file_path)
                    
    print("Backup created successfully.")
    return backup_filename

def send_email(file_path):
    """Sends the backup file via email."""
    print(f"Sending email to {TO_EMAIL}...")
    
    msg = MIMEMultipart()
    msg['From'] = FROM_EMAIL
    msg['To'] = TO_EMAIL
    msg['Subject'] = f"Project Backup: aoaodatacenter - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    
    # Attachment
    with open(file_path, "rb") as attachment:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(attachment.read())
    
    encoders.encode_base64(part)
    part.add_header(
        "Content-Disposition",
        f"attachment; filename= {os.path.basename(file_path)}",
    )
    msg.attach(part)
    
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_string())
        server.quit()
        print("Email sent successfully.")
    except Exception as e:
        print(f"Failed to send email: {e}")

def main():
    # 1. Create Backup
    backup_file = create_backup()
    
    # 2. Send Backup via Email
    send_email(backup_file)
    
    # 3. Clean up backup file
    if os.path.exists(backup_file):
        os.remove(backup_file)
        print("Local backup file removed.")

if __name__ == "__main__":
    main()
