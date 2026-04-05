# WarBoard: Command Your Time

**WarBoard is a strategic 14-day planning interface that transforms chaotic to-do lists into high-intensity "Focus Blocks." It is designed for those who need to stop simply "tracking" tasks and start winning their day through structured, visual momentum.**


## Why WarBoard?

Most productivity apps are just digital graveyards for tasks you’ll never do. WarBoard is different. It helps you enhance your life by:

* **Eliminating Decision Fatigue:** By mapping your next 14 days, you wake up knowing exactly what your "Main Quest" is, rather than wondering where to start.

* **Visualizing Capacity:** See exactly how much time you have left in a day. No more over-committing or burning out.

* **Project-Specific Clarity:** Group your efforts into specific projects so you can track progress on what actually matters, not just busy work.

* **Future-Proofing:** The 14-day horizon gives you enough foresight to prepare for deadlines without the overwhelming clutter of a monthly calendar.


## How to Use the WarBoard

The WarBoard is designed to be your "Command Center." Here is how you interact with it:

* **Survey the Horizon:** The main screen displays a rolling 14-day view. Each day is a fresh column ready for your plan.

* **Define Your Projects:** Use the sidebar to create your active projects. This helps you categorize your work (e.g., "Work," "Health," or "Math Research").

* **Define Project Deadlines:** Click "Add Deadline" under a day to create a deadline. Title your deadline, assign it to a project, and set the submission time.

* **Deploy Focus Blocks:** Click "Add Focus Block" under a day to create a "Focus Block." Think of this as a dedicated window of time where you are "going to war" on a specific goal. You set the start time and the duration.

* **Fill the Ranks (Tasks):** Inside each Focus Block, add specific tasks. You can assign them to projects, set how many minutes they should take, and reorder them to create the perfect workflow.

* **Watch the Cleanup:** The Board automatically sweeps away past days and orphaned data, keeping your interface clean, fast, and focused on the present moment.

For more information, sample images are available in the **demo** folder of this repository.

## How to Install and Run Locally
You don't need to be a computer scientist to run the WarBoard. Follow these steps to get set up on your own machine.

### Step 1: Download the Files

On the main page of this repository, click the green **Code** button.

Select **Download ZIP**.

Once downloaded, "Unzip" or "Extract" the folder to a place you can find it easily, like your **Desktop**.

### Step 2: Install Python

The WarBoard runs on a language called **Python**.

Go to [Python.org](https://www.python.org/downloads/).

Click the download button for your operating system (Windows or Mac).

**IMPORTANT:** When installing on Windows, make sure to check the box that says **"Add Python to PATH"** before clicking Install.

### Step 3: Open your Command Terminal

We need to give the computer a few typed commands.

**Windows:** Press the `Start` key, type `cmd`, and press Enter.

**Mac:** Press `Command + Space`, type `Terminal`, and press Enter.

### Step 4: Navigate to the Folder

Type `cd` (which stands for Change Directory), press the spacebar, and then drag your unzipped **WarBoard** folder directly into the terminal window. It should look something like this:
`cd C:\Users\YourName\Desktop\WarBoard-Main`
Press **Enter**.

### Step 5: Install the App's "Tools"

Type the following command and press Enter:
`pip install -r requirements.txt`
(This tells your computer to download the specific libraries the WarBoard needs to function.)

## Step 6: Start the WarBoard!

Type the final command:
`python wsgi.py`

The app is now running! Open your web browser (Chrome, Safari, or Edge) and type the following into the address bar:
[http://127.0.0.1:5000](http://127.0.0.1:5000)

When you are done running the app, you can stop the server by going to your Terminal window and pressing `Ctrl+C`.
