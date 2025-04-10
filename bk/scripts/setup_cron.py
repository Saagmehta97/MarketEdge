from crontab import CronTab
import os
import sys
import logging

def setup_cron_job():
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Get the absolute paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    get_data_script = os.path.join(current_dir, 'get_data.py')
    log_file = os.path.join(os.path.dirname(current_dir), 'data', 'cron.log')
    env_file = '/app/.env.cron'
    
    # Get Python path
    python_path = sys.executable
    
    # Create a new cron tab for the current user
    cron = CronTab(user=True)
    
    # Remove any existing jobs with the same command
    cron.remove_all(comment='marketedge_data_fetch')
    
    # Create the command with environment variables and logging
    cmd = f'/bin/bash -c \'while read -r line; do export "$line"; done < {env_file} && cd {os.path.dirname(current_dir)} && {python_path} {get_data_script} >> {log_file} 2>&1\''
    
    # Create a new cron job
    job = cron.new(command=cmd, comment='marketedge_data_fetch')
    
    # Set the schedule to run at 10 AM EDT (14:00 UTC)
    # job.hour.on(14)  # 14:00 UTC = 10:00 EDT


    # test every minute
    job.minute.every(1)
    
    # Write the crontab
    cron.write()
    logger.info("Cron job set up successfully!")
    logger.info(f"Command: {cmd}")
    logger.info(f"Schedule: At 10:00 AM EDT (14:00 UTC) every day")

if __name__ == "__main__":
    setup_cron_job() 