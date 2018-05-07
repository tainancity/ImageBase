#!/bin/bash
#
# 功能：將位於 /etc 資料夾底下的 letsencrypt 資料夾，壓縮至 /root/backup 資料夾底下，並以日期做區隔

########################每日備份/分割區###########################################################
date1=$(date +%F)

ssl_backup="ssl-"$date1".tar.gz"



#######################產生各個檔案##############################################################
tar -cvzf /root/backup/$ssl_backup -C /etc letsencrypt
#tar -cvzf /backup/$etc_backup /etc
