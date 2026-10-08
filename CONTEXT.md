# Resources Management

Frontend for creating, tracking and completing Resources through a two-module workflow, backed by a fixed backend contract.

## Language

### Resource lifecycle

**Resource**:
The unit of work being managed; identified by a numeric resource ID and a unique, immutable name.
_Avoid_: Item, record, entry

**Resource Name**:
The name given at creation; unique (case-insensitive) and locked forever after.
_Avoid_: Title, label

**Status**:
The lifecycle state of a Resource — exactly one of **Draft** or **Completed**.
_Avoid_: State, phase, stage

**Draft**:
A Resource whose Modules are still being filled in; Modules are saved one at a time.

**Completed**:
A Resource that has been Provisioned; its data can still be edited, but only through the Edit Buffer.
_Avoid_: Done, finished, published

**Provisioning**:
The single action that moves a Resource from Draft to Completed, allowed only when both Modules are complete and never repeatable.
_Avoid_: Complete action, publish, finalize

### Modules

**Module**:
One of the two independently edited sections of a Resource's data: **Basic Info** or **Project Details**.
_Avoid_: Step, section, tab, form

**Basic Info**:
The first Module — resource name, owner, email, description and priority.

**Project Details**:
The second Module — project name, budget, category and team members; unlocked for a Draft only once Basic Info is complete.

**Team Members**:
The roles assigned to a project in Project Details (stored by the backend under the name `options`).
_Avoid_: Options

**Complete Module**:
A Module whose every field holds a value (and at least one Team Member); the precondition for unlocking Project Details and for Provisioning.
_Avoid_: Valid module, filled module

**Incomplete Module**:
A Module with at least one empty field. There is no separate "not started" state — Basic Info always starts with the Resource Name filled.
_Avoid_: Not started, in progress, pending

**Locked Module**:
Project Details of a Draft whose Basic Info is not yet complete; it cannot be opened or edited.
_Avoid_: Disabled, blocked

**Module Progress**:
How many of a Resource's two Modules are complete (0/2, 1/2, 2/2).

### Editing a Completed Resource

**Edit Buffer**:
Unsubmitted Module changes to a Completed Resource, held only in the running app and lost on refresh or close.
_Avoid_: Draft (reserved for Status), cache, pending changes

**Submit Changes**:
Explicitly persisting a Resource's Edit Buffer as one full update, after which the buffer is emptied.
_Avoid_: Save, commit, sync

**Discard Changes**:
Emptying a Resource's Edit Buffer without persisting it.
_Avoid_: Cancel, revert
