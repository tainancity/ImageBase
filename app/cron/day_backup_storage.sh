#!/bin/bash
#
# 功能：將位於 /root/web/imagebase/storage 資料夾底下的 uploads 資料夾，壓縮至 /root/backup 資料夾底下，並以日期做區隔

########################每日備份/分割區###########################################################
date1=$(date +%F)

storage_backup="storage-"$date1".tar.gz"
#etc_backup="etc-"$date1".tar.gz"



#######################產生各個檔案##############################################################
tar -cvzf /root/backup/$storage_backup -C /root/web/imagebase/storage uploads
#tar -cvzf /backup/$etc_backup /etc
