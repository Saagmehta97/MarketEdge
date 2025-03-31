from crontab import CronTab
import os
import sys

def setup_cron_job():
    # Get the absolute path to the get_data.py script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    get_data_script = os.path.join(current_dir, 'get_data.py')
    
    # Create a new cron tab for the current user
    cron = CronTab(user=True)
    
    # Remove any existing jobs with the same command
    cron.remove_all(comment='marketedge_data_fetch')
    
    # Create a new cron job
    job = cron.new(command=f'python {get_data_script}', comment='marketedge_data_fetch')
    
    # Set the schedule to run at 10 AM EDT (14:00 UTC)
    job.hour.on(14)  # 14:00 UTC = 10:00 EDT
    job.minute.on(0)
    
    # Write the crontab
    cron.write()
    print("Cron job set up successfully!")

if __name__ == "__main__":
    setup_cron_job() 