# Setting Up Apache 2, MariaDB, and PHP on Raspberry Pi Linux

## Part 1: Installing Apache 2

### 1. Update the Package Index
Before starting the installation, ensure your package list is up to date:
```bash
sudo apt update
```

### 2. Install Apache 2
Install the Apache 2 web server using the following command:
```bash
sudo apt install apache2
```

### 3. Configure Apache to Start on Boot
Ensure that Apache starts automatically at boot:
```bash
sudo systemctl enable apache2
```

### 4. Verify Apache Installation
After installation, check if Apache is running:
```bash
sudo systemctl status apache2
```
You should see output indicating that Apache is active (running). You can also verify it by opening a web browser and navigating to `http://<your_pi_ip_address>/`. You should see the default Apache page.
```bash
hostname -I
```

### 5. Adjust Firewall Settings (if necessary)
If you have a firewall running, you need to allow HTTP and HTTPS traffic:
```bash
sudo ufw allow 'Apache Full'
```

### 6. Configure Virtual Hosts (Optional)
If you want to host multiple websites on your Raspberry Pi, you can set up virtual hosts.

1. **Create a Directory for Your Website:**
   ```bash
   sudo mkdir -p /var/www/html/example.com/public_html
   sudo chown -R $USER:$USER /var/www/html/example.com/public_html
   ```

2. **Set Permissions:**
   ```bash
   sudo chmod -R 755 /var/www/html
   ```

3. **Create a Sample Index Page:**
   ```bash
   nano /var/www/html/example.com/public_html/index.html
   ```
   Add some sample HTML content:
   ```html
   <html>
       <head>
           <title>Welcome to Example.com!</title>
       </head>
       <body>
           <h1>Hello World!</h1>
           <p>This is the home page for Example.com.</p>
       </body>
   </html>
   ```

4. **Create a Virtual Host Configuration File:**
   ```bash
   sudo nano /etc/apache2/sites-available/example.com.conf
   ```
   Add the following configuration:
   ```apache
   <VirtualHost *:80>
       ServerAdmin admin@example.com
       ServerName example.com
       ServerAlias www.example.com
       DocumentRoot /var/www/html/example.com/public_html
       ErrorLog ${APACHE_LOG_DIR}/error.log
       CustomLog ${APACHE_LOG_DIR}/access.log combined
   </VirtualHost>
   ```

5. **Enable the New Virtual Host:**
   ```bash
   sudo a2ensite example.com.conf
   ```

6. **Disable the Default Site:**
   ```bash
   sudo a2dissite 000-default.conf
   ```

7. **Test the Configuration:**
   ```bash
   sudo apache2ctl configtest
   ```

8. **Restart Apache:**
   ```bash
   sudo systemctl restart apache2
   ```

## Part 2: Installing MariaDB

### 1. Install MariaDB Server
To install MariaDB, run:
```bash
sudo apt install mariadb-server
```

### 2. Secure the MariaDB Installation
After installation, run the security script to secure your MariaDB server:
```bash
sudo mysql_secure_installation
```
You’ll be prompted with several questions:
- **Set a root password:** Choose a strong password.
- **Remove anonymous users:** Yes.
- **Disallow root login remotely:** Yes.
- **Remove test database:** Yes.
- **Reload privilege tables:** Yes.

### 3. Verify MariaDB Installation
Check that MariaDB is running:
```bash
sudo systemctl status mariadb
```
You can also log in to the MariaDB shell:
```bash
sudo mysql -u root -p
```
Enter the root password you set during the secure installation.

### 4. Create a Database and User (Optional)
Once logged into MariaDB, you can create a new database and user:

1. **Create a Database:**
   ```sql
   CREATE DATABASE my_database;
   ```

2. **Create a User:**
   ```sql
   CREATE USER 'my_user'@'localhost' IDENTIFIED BY 'my_password';
   ```

3. **Grant Privileges:**
   ```sql
   GRANT ALL PRIVILEGES ON my_database.* TO 'my_user'@'localhost';
   ```

4. **Flush Privileges:**
   ```sql
   FLUSH PRIVILEGES;
   ```

5. **Exit MariaDB:**
   ```sql
   EXIT;
   ```

### 5. Test Database Connection
To verify that the database is working correctly, you can create a simple PHP script:

1. **Install PHP and the MySQL Extension:**
   If you haven’t already, install PHP and the necessary extensions:
   ```bash
   sudo apt install php php-mysql
   ```

2. **Create a Test PHP File:**
   ```bash
   sudo nano /var/www/html/test_db.php
   ```
   Add the following code:
   ```php
   <?php
   $servername = "localhost";
   $username = "my_user";
   $password = "my_password";
   $dbname = "my_database";

   // Create connection
   $conn = new mysqli($servername, $username, $password, $dbname);

   // Check connection
   if ($conn->connect_error) {
       die("Connection failed: " . $conn->connect_error);
   }
   echo "Connected successfully";
   $conn->close();
   ?>
   ```

3. **Access the Test Page:**
   Open a web browser and navigate to `http://<your_pi_ip>/test_db.php`. You should see "Connected successfully" if everything is set up correctly.

## Summary
You now have a functioning Apache web server, a secure MariaDB database server, and PHP support on your Raspberry Pi. You can expand on this setup by adding additional features, configuring SSL, or hosting multiple websites based on your needs. Let me know if you need more help!
```

Feel free to copy and paste this Markdown text into your preferred editor or documentation tool! Let me know if you need any further modifications.
