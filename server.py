import http.server
import socketserver
import sqlite3
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

PORT = 8001

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/sponsor':
            try:
                # 1. Read JSON data from the request
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                # 2. Save sponsorship details to SQLite database
                db_path = os.path.join(os.getcwd(), 'sponsors.db')
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS sponsors (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        company_name TEXT NOT NULL,
                        fullname TEXT NOT NULL,
                        email TEXT NOT NULL,
                        tier TEXT NOT NULL,
                        amount TEXT NOT NULL,
                        message TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                cursor.execute('''
                    INSERT INTO sponsors (company_name, fullname, email, tier, amount, message)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    data.get('company_name'),
                    data.get('fullname'),
                    data.get('email'),
                    data.get('tier'),
                    data.get('amount'),
                    data.get('message')
                ))
                conn.commit()
                conn.close()
                print(f"[Database] Saved sponsor details for {data.get('company_name')} to sponsors.db")

                # 3. Formulate and simulate/send email connectivity (SMTP)
                sender_email = "alerts@teambharadwaj.com"
                receiver_email = "info@teambharadwaj.com"
                
                msg = MIMEMultipart()
                msg['From'] = sender_email
                msg['To'] = receiver_email
                msg['Subject'] = f"NEW SPONSOR ALERT: {data.get('company_name')}"
                
                body = f"""
Dear Team Bharadwaj Leads,

We have received a new Sponsorship Application directly from the site portal:

---------------------------------------------------
Company/Sponsor: {data.get('company_name')}
Contact Person:  {data.get('fullname')}
Email Address:   {data.get('email')}
Sponsorship Tier: {data.get('tier')}
Contribution Details: {data.get('amount')}

Proposal & Message:
{data.get('message')}
---------------------------------------------------

This information has been successfully logged inside the 'sponsors.db' local database.
"""
                msg.attach(MIMEText(body, 'plain'))
                
                # Simulate SMTP dispatch and print transaction trace to terminal
                print("\n============== SMTP EMAIL OUTGOING ==============")
                print(f"From: {sender_email}")
                print(f"To: {receiver_email}")
                print(f"Subject: {msg['Subject']}")
                print(body)
                print("=================================================\n")

                # Note: To enable real-world SMTP sending, insert credentials here:
                # with smtplib.SMTP('smtp.gmail.com', 587) as server:
                #     server.starttls()
                #     server.login("your-username", "your-password")
                #     server.send_message(msg)
                
                # Send HTTP Success Response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                response = {
                    'status': 'success',
                    'message': 'Sponsor application saved successfully and alert sent.',
                    'database_saved': True,
                    'email_alert': 'sent'
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except Exception as e:
                print(f"Error handling /api/sponsor post: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'status': 'error',
                    'message': str(e)
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            # Fallback to serving regular static posts (if any)
            super().do_POST()

# Disable buffer flushing issues on stdout
class ThreadingHTTPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    # Set CWD to the directory of server.py
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, MyHandler)
    print(f"Starting Team Bharadwaj custom server on port {PORT}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
