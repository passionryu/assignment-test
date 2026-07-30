# Assignment Requirements

This document summarizes the implementation assignment requirements without including company or client identifiers.

## Core Task

Build a content-service web application. The main product should be the content service itself, and a print/book-style order flow should work as a secondary business feature.

## Evaluation Levels

| Level | Requirement | Review Focus |
| --- | --- | --- |
| Lv1 | Implement the core content service flow, such as create, read, update, and inspect content. | A complete and usable service flow |
| Lv2 | Add an order flow that lets users request a book/print-style output from selected content. Store, inspect, and update order state. | Working business logic |
| Lv3 | Design the UI/UX around a concrete target user. Include clear flows, helpful states, validation feedback, and responsive behavior. | User-centered product judgment |

## Required Submission Conditions

- The application must run with `docker-compose up` or an equivalent one-command Docker flow.
- Ports must be configurable through environment variables or compose configuration.
- Seed data must be included so the service can be inspected immediately without login.
- `README.md` must explain how to run and inspect the app.
- The repository must be public before submission.
- Secrets, API keys, passwords, and private credentials must not be committed.

## README Requirements

- Service summary.
- Target user.
- Main features.
- Docker execution instructions.
- Implemented level scope: Lv1, Lv2, Lv3.
- UI/UX design rationale.
- Technology stack and architecture.
- AI tool usage.
- Design decisions and future improvements.

## Initial Scope Policy

- Prioritize a complete Lv1 flow before expanding scope.
- Implement Lv2 as a stateful order workflow, not real payment, shipping, or production.
- Treat Lv3 as a product judgment and usability requirement, not a visual decoration task.
- Avoid runtime dependencies on external paid APIs unless a mock or local fallback exists.

