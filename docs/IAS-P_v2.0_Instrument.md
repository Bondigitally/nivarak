# IAS v2.0 — Instrument Specification

**Independent Ageing Score — Proxy Version 2.0 (product name: IAS)**

Canonical reference for question count, prompts, answer options, scoring, and red flags.  
Source of truth for API parameter keys: `server/src/modules/scoring/ias-calculator.ts`.  
Frontend wizard copy: `client/features/assessments/data/iasp-questionnaire-data.ts`.

---

## Summary

| Property | Value |
| -------- | ----- |
| Wizard items | **25** (24 scored + 1 contextual medication-count) |
| Scored items | **24** |
| Sections | **8** (A–H) |
| Default answer options | **3** (Independent / Some support / Dependent) |
| Points per scored item | 0, 1, or 2 |
| Max raw score (internal) | **48** (24 × 2) |
| Displayed score | **IAS%** = `(raw_score / 48) × 100` |
| Risk bands | 5 |
| Red flags (separate checklist) | 8 |

---

## Response scale (default scored items)

Helper text shown in the wizard:

> Please answer based on how your parent has functioned in the past 4 weeks.

| UI label | API value | Points | Description |
| -------- | --------- | ------ | ----------- |
| **Independent** | `2` | 2 | Does safely without help |
| **Some support** | `1` | 1 | Needs reminders, supervision, or occasional help |
| **Dependent** | `0` | 0 | Needs regular help or cannot do alone / unsafe |

Keyboard shortcuts: **1** / **2** / **3** map to the options shown for that question.

---

## Section breakdown

| Section | Domain key | Wizard items | Scored | Max section score |
| ------- | ---------- | ------------ | ------ | ----------------- |
| A — Basic Self-Care | `basic_self_care` | 4 | 4 | 8 |
| B — Daily Life Function | `daily_life_function` | 4 | 4 | 8 |
| C — Mobility | `mobility` | 4 | 4 | 8 |
| D — Thinking & Decision-Making | `thinking_decision` | 3 | 3 | 6 |
| E — Health Management | `health_management` | 4 | 3 | 6 |
| F — Nutrition & Continence | `nutrition_continence` | 3 | 3 | 6 |
| G — Social Function | `social_function` | 2 | 2 | 4 |
| H — Safety & Support | `safety_support` | 1 | 1 | 2 |
| **Total** | | **25** | **24** | **48** |

---

## Complete question inventory

| # | Section | API parameter | Question prompt | Options |
| - | ------- | ------------- | --------------- | ------- |
| 1 | A | `bathing` | Bathing | Default 0–2 |
| 2 | A | `dressing` | Dressing | Default 0–2 |
| 3 | A | `toileting` | Toileting | Default 0–2 |
| 4 | A | `feeding` | Feeding / eating meals | Default 0–2 |
| 5 | B | `phone_communication` | Using phone / communicating when needed | Default 0–2 |
| 6 | B | `daily_home_tasks` | Managing small daily tasks in the home | Default 0–2 |
| 7 | B | `simple_purchases` | Handling simple purchases or money matters | Default 0–2 |
| 8 | B | `organizing_essentials` | Organizing daily essentials (food, medicines, etc.) | Default 0–2 |
| 9 | C | `moving_inside_house` | Moving safely inside the house | Default 0–2 |
| 10 | C | `getting_up` | Getting up from bed or chair | Default 0–2 |
| 11 | C | `walking_outside` | Walking outside / in common areas | Default 0–2 |
| 12 | C | `falls_6_months` | In the last 6 months, does the patient have any falls? | No fall (2) · One fall (1) · Two or more falls (0) |
| 13 | D | `remembering_routine` | Remembering routine daily tasks | Default 0–2 |
| 14 | D | `understanding_instructions` | Understanding instructions or advice | Default 0–2 |
| 15 | D | `safe_decisions` | Making safe everyday decisions | Default 0–2 |
| 16 | E | *(contextual, not scored)* | Does the patient take more than 5 medications? | Yes · No |
| 17 | E | `taking_medicines` | Taking medicines correctly | Default 0–2 |
| 18 | E | `understanding_health` | Understanding their main medical problems | Default 0–2 |
| 19 | E | `following_appointments` | Following appointments or treatment advice | Default 0–2 |
| 20 | F | `eating_drinking` | Eating and drinking adequately | Default 0–2 |
| 21 | F | `weight_appetite` | Weight / appetite stability | Stable (2) · Mild concern (1) · Significant concern (0) |
| 22 | F | `bladder_bowel` | Bladder / bowel control | Default 0–2 |
| 23 | G | `communicating_needs` | Communicating needs clearly | Default 0–2 |
| 24 | G | `social_contact` | Maintaining regular contact with family or others | Yes (2) · No (0) |
| 25 | H | `emergency_help` | Ability to get help in an emergency | Clear reliable system (2) · Some support available (1) · No reliable system (0) |

### Frontend ↔ API parameter map

| Frontend question `id` | API parameter |
| ------------------------ | ------------- |
| `bathe` | `bathing` |
| `dress` | `dressing` |
| `toilet` | `toileting` |
| `eat-drink` | `feeding` |
| `phone` | `phone_communication` |
| `home-tasks` | `daily_home_tasks` |
| `purchases` | `simple_purchases` |
| `essentials` | `organizing_essentials` |
| `move-home` | `moving_inside_house` |
| `transfer` | `getting_up` |
| `outdoors` | `walking_outside` |
| `falls` | `falls_6_months` |
| `routines` | `remembering_routine` |
| `instructions` | `understanding_instructions` |
| `decisions` | `safe_decisions` |
| `medication-count` | *(UI only — not submitted as IAS parameter)* |
| `medications` | `taking_medicines` |
| `understand-health` | `understanding_health` |
| `appointments` | `following_appointments` |
| `nutrition-hydration` | `eating_drinking` |
| `weight-appetite` | `weight_appetite` |
| `continence` | `bladder_bowel` |
| `communicate` | `communicating_needs` |
| `social-contact` | `social_contact` |
| `summon-help` | `emergency_help` |

---

## About you (proxy metadata)

| Field | Options |
| ----- | ------- |
| Relationship | Spouse / Partner · Son / Daughter · Sibling · Other family member · Friend · Professional caregiver |
| Location | Same household · Same city · Same state · Different state · **Different country** |
| Visit frequency | Daily · Several times a week · Weekly · Monthly · A few times a year · Rarely / remotely |
| Living situation | Alone · With spouse · With family · With caregiver · **Other** (free text) |

---

## Red flags (8 items — not scored)

| # | API key | Label |
| - | ------- | ----- |
| 1 | `two_or_more_falls` | Two or more falls in the last 6 months |
| 2 | `missed_incorrect_medicines` | Missed or taken medications incorrectly |
| 3 | `unsafe_decisions` | Recently made unsafe decisions |
| 4 | `significant_weight_loss` | Significant or unexplained weight loss |
| 5 | `social_isolation` | Showing signs of social isolation |
| 6 | `recurrent_hospital_admissions` | Recurrent hospital admissions |
| 7 | `caregiver_struggling` | Primary caregiver is struggling or absent |
| 8 | `no_emergency_response` | Cannot summon help in an emergency |

### Urgency tiers

| Flag count | Urgency |
| ---------- | ------- |
| 0 | `routine_monitoring` |
| 1–2 | `review_needed` |
| 3+ | `urgent_care_planning` |

---

## Risk bands

| IAS% | Risk band | Recommended pathway |
| ---- | --------- | ------------------- |
| 85–100 | Strong Independent | Home care |
| 70–84 | Independent but Vulnerable | Home care |
| 55–69 | Supported Independence | Hybrid care |
| 40–54 | Limited Independence | Clinic care |
| 0–39 | High Dependence | High dependency |

Results UI shows **IAS%**, not raw `/48`.

---

## Related files

| Layer | Path |
| ----- | ---- |
| API calculator | `server/src/modules/scoring/ias-calculator.ts` |
| API validation | `server/src/modules/scoring/scoring.schema.ts` |
| Frontend questions | `client/features/assessments/data/iasp-questionnaire-data.ts` |
| Frontend scoring | `client/features/assessments/data/iasp-scoring.ts` |
| Frontend red flags | `client/features/assessments/data/iasp-red-flags-data.ts` |
