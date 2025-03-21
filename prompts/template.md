# Project Requirements

## Response Format
The response should be operational JSON with the following structure:
{
    "files": {
        "file1Name": "full content",
        "file2Name": "full content",
        "file3Name": "full content"
    },
    "git": {
        "shouldPush": false,
        "message": "the changement in this commit"
    },
    "command": "command to execute for example 'npm i fs npm run start'",
    "testCommands": " commands to test the project forms and post requests all that exist in this update",
    "testUrl": "for example http://127.0.0.1:3000/"
}
and contain only the files to create or modify, means what to change.
Important: The response should only contain this JSON structure with no additional comments before or after. Each file should include its path as a comment at the beginning. Keep files under 200 lines for better maintainability.

## Additional Notes
all responses in this chat should be in the json structure given.
give only the files needed to be changed, not all the files in the project.
for database if needed , make sure the tables are created , and give me ready to publish project.
in package.json dont put comments
use random port in express

## Technical Stack
- Server if needed:  Node.js, Express
- Templating if server is needed:  Nunjucks
- Database if needed: SQLite local
- Frontend: HTML/CSS/JS, React

## Functional Requirements
- User Authentication: make it as string id
- Forms: no specifications
- API Integrations: no specifications
- Dynamic Content: no specifications


## Design & UI Requirements
- Theme:  Golden 
- Responsiveness: mobile/desktop
- Color Scheme: you choose best fit the subject



## Project Structure
no specification

## Specific Tasks to Focus On
front end should be perfect designe , it does not need more perfection



## Project Overview
a to do list perfect web app friendly