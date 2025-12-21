# TODO: Editable Host Name Feature

## Overview
Make the "Welcome, Host!" text clickable so hosts can personalize their display name. This is a quick win that improves the user experience with minimal implementation effort.

---

## Current State
- File: `client/src/pages/PlayScreen.tsx`
- Line 249: `<h2 className="text-4xl font-bold">Welcome, Host!</h2>`
- The text "Host" is hardcoded
- No personalization option exists

## Target State
- "Welcome, Host!" becomes "Welcome, [Custom Name]!"
- Clicking the name opens an inline edit or modal
- Name persists across sessions (localStorage minimum, DB optional)
- Default remains "Host" if not customized

---

## Implementation Steps

### Step 1: Add State Management
**File:** `client/src/pages/PlayScreen.tsx`

Add state for the host name near the top of the component (around line 50-60 where other state is defined):

```typescript
// Add this with other useState declarations
const [hostName, setHostName] = useState<string>(() => {
  return localStorage.getItem('hostDisplayName') || 'Host';
});
const [isEditingName, setIsEditingName] = useState(false);
const [editNameValue, setEditNameValue] = useState(hostName);
```

### Step 2: Create the Editable Name Component
**File:** `client/src/pages/PlayScreen.tsx`

Replace the static h2 (around line 249) with an interactive version:

```tsx
{/* Replace this: */}
<h2 className="text-4xl font-bold">Welcome, Host!</h2>

{/* With this: */}
<h2 className="text-4xl font-bold">
  Welcome,{" "}
  {isEditingName ? (
    <span className="inline-flex items-center gap-2">
      <input
        type="text"
        value={editNameValue}
        onChange={(e) => setEditNameValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSaveHostName();
          } else if (e.key === 'Escape') {
            setIsEditingName(false);
            setEditNameValue(hostName);
          }
        }}
        className="bg-transparent border-b-2 border-primary outline-none text-4xl font-bold w-48"
        autoFocus
      />
      <button
        onClick={handleSaveHostName}
        className="text-primary hover:text-primary/80"
      >
        <Check className="h-6 w-6" />
      </button>
      <button
        onClick={() => {
          setIsEditingName(false);
          setEditNameValue(hostName);
        }}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-6 w-6" />
      </button>
    </span>
  ) : (
    <button
      onClick={() => setIsEditingName(true)}
      className="hover:text-primary transition-colors cursor-pointer underline decoration-dotted underline-offset-4"
      title="Click to edit your name"
    >
      {hostName}
    </button>
  )}
  !
</h2>
```

### Step 3: Add the Save Handler
**File:** `client/src/pages/PlayScreen.tsx`

Add this function near other handlers in the component:

```typescript
const handleSaveHostName = () => {
  const trimmedName = editNameValue.trim();
  if (trimmedName) {
    setHostName(trimmedName);
    localStorage.setItem('hostDisplayName', trimmedName);
  }
  setIsEditingName(false);
};
```

### Step 4: Add Required Imports
**File:** `client/src/pages/PlayScreen.tsx`

Ensure these icons are imported from lucide-react (check existing imports around line 1-20):

```typescript
import { Check, X } from "lucide-react";
```

Note: Check if these are already imported. If not, add them to the existing lucide-react import line.

---

## File Changes Summary

### Files to Modify
| File | Changes |
|------|---------|
| `client/src/pages/PlayScreen.tsx` | Add state, handler, and editable UI |

### Lines to Modify in PlayScreen.tsx
1. **Imports section (top of file):** Add `Check, X` to lucide-react imports if not present
2. **State declarations (~line 50-60):** Add `hostName`, `isEditingName`, `editNameValue` state
3. **Handlers section:** Add `handleSaveHostName` function
4. **Line 249:** Replace static `<h2>` with interactive version

---

## Testing Checklist

- [ ] Click on "Host" text opens edit mode
- [ ] Typing updates the input field
- [ ] Press Enter saves the name
- [ ] Press Escape cancels edit
- [ ] Click checkmark saves the name
- [ ] Click X cancels edit
- [ ] Name persists after page refresh
- [ ] Empty name is not allowed (keeps previous)
- [ ] Name displays correctly in welcome message
- [ ] Styling matches existing design

---

## Optional Enhancements (Not Required)

### Enhancement A: Toast Notification on Save
```typescript
import { toast } from "sonner"; // If using sonner

const handleSaveHostName = () => {
  const trimmedName = editNameValue.trim();
  if (trimmedName) {
    setHostName(trimmedName);
    localStorage.setItem('hostDisplayName', trimmedName);
    toast.success(`Welcome, ${trimmedName}!`);
  }
  setIsEditingName(false);
};
```

### Enhancement B: Persist to Database
If you want the name to sync across devices, add a tRPC mutation:

```typescript
// In server/routers.ts
updateHostDisplayName: protectedProcedure
  .input(z.object({ displayName: z.string().min(1).max(50) }))
  .mutation(async ({ ctx, input }) => {
    // Store in user preferences table or users table
    // Implementation depends on schema
  }),
```

### Enhancement C: Modal Instead of Inline Edit
Use the existing Dialog component from shadcn/ui for a more polished experience.

---

## Branch & Commit Instructions

### Before Starting
```bash
git checkout card-gen-enhancements
git pull origin card-gen-enhancements
```

### After Implementation
```bash
git add client/src/pages/PlayScreen.tsx
git commit -m "FEAT: Add editable host name

- Click 'Host' in welcome message to edit
- Name persists in localStorage
- Enter to save, Escape to cancel
- Inline edit with check/X buttons"
git push origin card-gen-enhancements
```

---

## Estimated Effort
- Implementation: 30-45 minutes
- Testing: 15 minutes
- **Total: ~1 hour**

---

## Success Criteria
- [ ] "Host" text is clickable
- [ ] Edit mode shows input field
- [ ] Save/cancel functionality works
- [ ] Name persists across sessions
- [ ] No visual regressions
- [ ] Works on mobile viewport
