#!/bin/bash
#
# 功能：備份 MariaDB 中的 imagebase_production 資料庫，存成 sql 檔，
# 並壓縮至 /root/backup 資料夾底下，並以日期做區隔

########################每日備份/分割區###########################################################
date1=$(date +%F)

mariadb_backup="sql-"$date1".tar.gz"
#etc_backup="etc-"$date1".tar.gz"



#######################產生各個檔案##############################################################
mysqldump -u$mariadb_user -p$mariadb_password -a imagebase_production > /root/backup/db_backup_$date1.sql
tar -cvzf /root/backup/$mariadb_backup -C /root/backup db_backup_$date1.sql
yes | rm -r /root/backup/db_backup_$date1.sql
