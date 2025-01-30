# GTM-to-Google-Sheet
This script parses a Google Tag Manager container and stores it in a Google Sheet for easy documentation and coordination

### Use cases:
- User friendly documentation
- Internal tracking coordination
- Filter and search by any tag, trigger, or variable property

### Example:
See an example Google Sheet with GTM documentation here https://docs.google.com/spreadsheets/d/1MwfAUch6mbgNMr8xC2wRwV9AvPYX8-P73OWIaUJauFM/edit?gid=0#gid=0

### Features:
**Container Details**
Stores the container ID, the current version that is stored in the sheet, and the time and date of last refresh.

**Tags**
Stores the following information about tags:
- Tag ID
- Tag Name
- Tag Type
- Tag Details
- Firing Trigger ID (tags with multiple firing triggers are duplicated into a separate row per firing trigger)
- Firing trigger name
- GTM notes (notes about the tag stoed within the GTM interface)
- Local notes (notes about the tag stored in a specified column in the Google Sheet. These notes stay attached to the corresponding tag ID even when the sheet is refreshed with a new container version)
- Folder

**Triggers**
Stores the following information about triggers:
- Trigger ID
- Trigger name
- Trigger conditions
- GTM Notes (see above)
- Local notes (see above)
- Folder

**Variables**
Stores the following information about variables:
- Variable ID
- Variable scope (built in, vs custom)
- Variable name
- Variable type
- Variable details
- GTM notes (see above)
- Local notes (see above)
- Folder

**Can be set to periodically refresh latest container information**

## Instructions

1. **Duplicate Sheet Template**
- Visit: https://docs.google.com/spreadsheets/d/1BTxWdKOKQt4uFDCSTkXRa0jQ82cwrjvo48DGJyXOPCQ/edit

- Click _File > Make a copy_

- Then in the pop up window click _Make a copy_ (You can rename your sheet from this window or later by clicking on the title)

<img width="461" alt="image" src="https://github.com/user-attachments/assets/17bc7847-0ee5-4bec-8eff-20f7a3008e2c" />

2. **Copy and paste script**

- In your new sheet, click _Extensions > Apps Script_

![image](https://github.com/user-attachments/assets/ed31affe-01bb-423d-b6fb-6c4f842c99e9)

- This will open a new Apps Script project. In the _Code.gs_ file, remove any existing code and paste the entire script found here https://github.com/c-will-t/GTM-to-Google-Sheet/blob/main/GTM-to-Google-Sheet.js

![image](https://github.com/user-attachments/assets/7ff82814-a3cd-4265-81c6-3e586846f2c6)

3. **Update script**

![image](https://github.com/user-attachments/assets/2e3690e9-b1f4-4a64-934b-5e76fa51de19)


- Open your GTM container and copy the account ID, which is found in the URL of your container after _/accounts/_. Do not include any forward slashes (Example: _tagmanager.google.com/#/container/accounts/**your_account_id**/containers/**your_container_id**/_). Now paste the account ID on line 4 of the script, replacing "YOUR_GTM_ACCOUNT_ID" (make sure your account ID is wrapped in quotes or apostrophes). Repeat the same process with your container ID on line 6/

- In your google sheet, copy the ID found in the URL after "/d/" (example: _docs.google.com/spreadsheets/d/**your_spreadsheet_id**/edit_). Paste this ID on line 8 of your script, replacing "YOUR_SPREADSHEET_ID"

4. **Install GTM service**
   
- In Apps Script, click the plus sign next to _Services_

- In the pop up menu, click _Tag Manager API_, then click _Add_.

  ![image](https://github.com/user-attachments/assets/c3a54f44-52f7-40ba-900c-6f5cb77ff5d8)

5.  **Give it a test run**

- Click the _Run_ button at the top of your script. **Note:** you will likely have to go through a few permission screens on the first run in order to grant the script access to your GTM account.
  
![image](https://github.com/user-attachments/assets/379fe58a-bb7b-42e8-932f-65c4d6c4bac6)

- Once the Execution Log says "Execution completed" check your sheet to see the results. **Note:** it may take a few minutes for the script to finish, depending on how big your GTM container is.

![image](https://github.com/user-attachments/assets/12945012-4a25-4944-9357-47d05643602c)

- The _Container Details_ tab of your sheet should now show the correct Container ID, a version number, and a refresh date. Additionally, all of your tags, triggers, and variables are now stored in the sheet!

6. **Set sheet to refresh periodically (optional)**

- In Apps Script, hover over the left hand column and click _Triggers_

![image](https://github.com/user-attachments/assets/df11f55d-73ef-4616-af7e-4e0ee6a01697)

- Next, click _Add Trigger_ in the bottom right of the screen. Make sure under "Choose which function to run" you select _checkLiveVersion_

- From here you can configure the trigger how you like. I suggest setting the trigger to fire every day around midnight by setting the event source to _Time-driven_, the Type to _Day timer_, and the time of day to _Midnight to 1am_. But you might choose to have the trigger fire more or less often depending on how often you update your GTM container. You can always manually refresh the sheet as well.

![image](https://github.com/user-attachments/assets/a6d3b628-ee70-423b-ba6d-ca3200a7f77e)

**Refreshing manually**
- You can refresh the sheet at any time by repeating step 5.
 




