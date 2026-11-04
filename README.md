# 📚 StudyWise - Smart Study Planner

StudyWise helps students plan exam preparation. Enter your subjects, exam dates and difficulty, tell it how many hours you can study per day, and it builds a 7-day study plan.

## The problem
Many students study what they like, not what is most urgent. They end up cramming hard subjects at the last minute.

## Our solution
StudyWise gives every subject a priority score:

`priority = difficulty / (days left + 1)`

Harder subjects and closer exams get more study hours. Your daily hours are split in proportion to these scores, so the plan updates automatically each day.

## Features
- Add and remove subjects with exam date and difficulty
- Automatic 7-day study plan
- "Focus today" highlight
- Urgent subjects (exam within 2 days) shown in red
- Data saved in the browser (no sign-up, no server)

## Tech stack
HTML, CSS, JavaScript (no frameworks)

## How to run
1. Download or clone this repo
2. Open `index.html` in any browser

## Future scope
- Mobile app version
- Reminders and notifications
- Progress tracking and streaks
- AI-generated study tips

## Team
- Member 1 - Code
- Member 2 - Design
- Member 3 - Presentation
