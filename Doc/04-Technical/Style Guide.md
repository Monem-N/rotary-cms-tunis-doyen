
# **Rotary Tunis Doyen Club Style Guide**

**Version 1.0**
**Last Updated**: August 24, 2025

---

## **1. Introduction**

This style guide provides rules and best practices for implementing the **Rotary Tunis Doyen Club’s Tailwind CSS theme**. It ensures consistency with **Rotary International’s brand guidelines**, accessibility standards, and multilingual (Arabic/RTL) support.

---

## **2. Brand Alignment**

### **2.1 Official Colors**

Use **only** the official Rotary brand colors:

| Color Name          | HEX Value   | Usage                          |
|---------------------|-------------|--------------------------------|
| Rotary Royal Blue   | `#17458f`   | Primary buttons, headings      |
| Rotary Gold         | `#f7a81b`   | Accents, secondary buttons    |
| Rotary Blue Dark    | `#0f3670`   | Hover states, dark mode        |
| Rotary Gold Dark    | `#d88e00`   | Text on light backgrounds      |

**Do not** use approximate colors or custom variants unless explicitly defined in this guide.

---

### **2.2 Typography**

#### **2.2.1 Font Families**

- **Latin Script**: `Avenir Next, Open Sans, Arial, system-ui, sans-serif`
- **Arabic Script**: `"Traditional Arabic", Amiri, "Scheherazade New", sans-serif`

#### **2.2.2 Font Weights and Sizes**

| Element          | Font Weight       | Font Size (REM) | Line Height | Letter Spacing |
|------------------|-------------------|-----------------|-------------|----------------|
| Headings (H1-H3) | `var(--font-weight-bold)` | `var(--text-4xl)` to `var(--text-2xl)` | `var(--leading-tight)` | `var(--tracking-tight)` |
| Body Text        | `var(--font-weight-regular)` | `var(--text-base)` | `var(--leading-normal)` | `var(--tracking-normal)` |
| Buttons          | `var(--font-weight-semibold)` | `var(--text-sm)` | `var(--leading-normal)` | `var(--tracking-wide)` |

**Example Usage**:

```html
<h1 class="h1">Welcome to Rotary Tunis Doyen Club</h1>
<p class="body-text">Our mission is to serve the community.</p>
<button class="btn-primary button-text">Join Us</button>
```

---

## **3. Components**

### **3.1 Buttons**

- **Primary Button**: Use for **main actions** (e.g., "Join Now," "Donate").

  ```html
<button class="btn-primary">Primary Action</button>
```
- **Secondary Button**: Use for **secondary actions** (e.g., "Learn More").
  ```html
<button class="btn-secondary">Secondary Action</button>
```

**Hover/Focus States**:

- Buttons should **scale slightly** (`transform: scale(1.02)`) and **darken** on hover.
- Ensure **focus rings** are visible for keyboard navigation.

---

### **3.2 Cards**

- Use for **content blocks** (e.g., event cards, member profiles).

  ```html
<div class="card">
    <h3>Event Title</h3>
    <p>Event description goes here.</p>
  </div>
```
- **Hover Effect**: Cards should lift slightly (`transform: translateY(-2px)`) and gain a subtle shadow.

---

### **3.3 Navigation**

- Use the `.nav-menu` and `.nav-link` classes for **consistent navigation**.

  ```html
<ul class="nav-menu">
    <li><a href="#" class="nav-link">Home</a></li>
    <li><a href="#" class="nav-link">About</a></li>
  </ul>
```
- **Hover State**: Links should change to `var(--color-rotary-blue-light)` on hover.

---

## **4. Layout and Spacing**

### **4.1 Containers**

- Use the `.container` class for **centered content**:

  ```html
<div class="container">
    <!-- Content here -->
  </div>
```

### **4.2 Grid System**

- Use `.grid-2` or `.grid-3` for **responsive grids**:

  ```html
<div class="grid-2">
    <div>Column 1</div>
    <div>Column 2</div>
  </div>
```

### **4.3 Spacing Utilities**

- Use `.section-padding` for **vertical spacing**:

  ```html
<section class="section-padding">
    <!-- Section content -->
  </section>
```

---

## **5. Animations**

### **5.1 Fade-In**

- Apply to elements that should **fade in smoothly**:

  ```html
<div class="fade-in">Content</div>
```

### **5.2 Pulse**

- Use for **call-to-action buttons** to draw attention:

  ```html
<button class="btn-primary pulse">Donate Now</button>
```

### **5.3 Hover Scale**
- Apply to **interactive elements** (e.g., cards, buttons):
  ```html
<div class="card hover-scale">Hover me!</div>
```

---

## **6. Accessibility**

### **6.1 Contrast**

- Ensure **all text** meets **WCAG AA/AAA contrast ratios** (minimum 4.5:1).
- Use the **official Rotary colors** for buttons and backgrounds.

### **6.2 Keyboard Navigation**

- All interactive elements (buttons, links) must be **keyboard-accessible**.
- Use `:focus-visible` for **visible focus rings**:

  ```css
:focus-visible {
    outline: 2px solid var(--color-ring);
    outline-offset: 2px;
  }
```

### **6.3 High Contrast Mode**
- Test components in **high contrast mode** to ensure readability:
  ```css
@media (prefers-contrast: high) {
    .btn-primary {
      border: 2px solid black;
    }
  }
```

---

## **7. RTL and Arabic Support**

### **7.1 Font Application**

- Apply the `.font-arabic` class to **Arabic text**:

  ```html
<p class="font-arabic">النص بالعربية</p>
```

### **7.2 RTL Layout**

- Use `dir="rtl"` for **right-to-left layouts**:

  ```html
<div dir="rtl">
    <p>هذا نص بالعربية</p>
  </div>
```
- **RTL-Specific Adjustments**:
  - Mirror margins/padding (e.g., `.ml-auto` becomes `.mr-auto`).
  - Ensure **icons and components** are mirrored.

---

## **8. Dark Mode**

### **8.1 Implementation**

- Use the `.theme-dark` class for **manual dark mode toggling**:

  ```html
<body class="theme-dark">
    <!-- Dark mode content -->
  </body>
```
- **Media Query Support**:
  ```css
@media (prefers-color-scheme: dark) {
    :root {
      --color-background: #0f172a;
    }
  }
```

### **8.2 Component Adjustments**

- Buttons, cards, and text should **adapt to dark mode**:

  ```css
.theme-dark .card {
    background-color: var(--color-card);
    border-color: rgba(248, 250, 252, 0.1);
  }
```

---

## **9. Print Styles**
- Use the `.no-print` class to **hide non-essential elements**:
  ```html
<div class="no-print">This won’t print</div>
```

- Ensure **colors and backgrounds** print correctly:

  ```css
@media print {
    .btn-primary {
      -webkit-print-color-adjust: exact;
    }
  }
```

---

## **10. Best Practices**
1. **Consistency**: Always use the **defined classes and variables** (e.g., `--color-primary`, `.btn-primary`).
2. **Testing**: Validate the theme in **light/dark modes**, **RTL layouts**, and **high contrast**.
3. **Documentation**: Comment your code to explain **custom implementations**.
4. **Feedback**: Gather input from **Arabic-speaking users** to refine RTL support.

---

## **11. Troubleshooting**
| Issue                     | Solution                                  |
|---------------------------|-------------------------------------------|
| Colors appear incorrect   | Verify HEX values match the style guide.  |
| Arabic text misaligned   | Ensure `dir="rtl"` and `.font-arabic` are applied. |
| Animations not working   | Check for conflicting CSS transitions.    |
| Dark mode not applying    | Ensure `.theme-dark` is added to `<body>`. |

---

## **12. Resources**
- **Rotary Brand Center**: [brandcenter.rotary.org](https://brandcenter.rotary.org)
- **Tailwind CSS Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **WCAG Guidelines**: [w3.org/WAI/standards-guidelines/wcag](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

### **Final Notes**
This style guide ensures your implementation of the **Rotary Tunis Doyen Club’s theme** is **consistent, accessible, and aligned with Rotary International’s brand**. Use it as a reference for all development work, and update it as the theme evolves.

Would you like to add **specific examples** (e.g., a full page template) or **additional components** (e.g., modals, forms)?Here’s a **comprehensive style guide** for developers working with the **Rotary Tunis Doyen Club’s Tailwind CSS theme**. This guide ensures consistent implementation of the theme, covering **brand alignment, typography, components, accessibility, and RTL/Arabic support**.

---

# **Rotary Tunis Doyen Club Style Guide**
**Version 1.0**
**Last Updated**: August 24, 2025

---

## **1. Introduction**
This style guide provides rules and best practices for implementing the **Rotary Tunis Doyen Club’s Tailwind CSS theme**. It ensures consistency with **Rotary International’s brand guidelines**, accessibility standards, and multilingual (Arabic/RTL) support.

---

## **2. Brand Alignment**
### **2.1 Official Colors**
Use **only** the official Rotary brand colors:

| Color Name          | HEX Value   | Usage                          |
|---------------------|-------------|--------------------------------|
| Rotary Royal Blue   | `#17458f`   | Primary buttons, headings      |
| Rotary Gold         | `#f7a81b`   | Accents, secondary buttons    |
| Rotary Blue Dark    | `#0f3670`   | Hover states, dark mode        |
| Rotary Gold Dark    | `#d88e00`   | Text on light backgrounds      |

**Do not** use approximate colors or custom variants unless explicitly defined in this guide.

---

### **2.2 Typography**
#### **2.2.1 Font Families**
- **Latin Script**: `Avenir Next, Open Sans, Arial, system-ui, sans-serif`
- **Arabic Script**: `"Traditional Arabic", Amiri, "Scheherazade New", sans-serif`

#### **2.2.2 Font Weights and Sizes**
| Element          | Font Weight       | Font Size (REM) | Line Height | Letter Spacing |
|------------------|-------------------|-----------------|-------------|----------------|
| Headings (H1-H3) | `var(--font-weight-bold)` | `var(--text-4xl)` to `var(--text-2xl)` | `var(--leading-tight)` | `var(--tracking-tight)` |
| Body Text        | `var(--font-weight-regular)` | `var(--text-base)` | `var(--leading-normal)` | `var(--tracking-normal)` |
| Buttons          | `var(--font-weight-semibold)` | `var(--text-sm)` | `var(--leading-normal)` | `var(--tracking-wide)` |

**Example Usage**:
```html
<h1 class="h1">Welcome to Rotary Tunis Doyen Club</h1>
<p class="body-text">Our mission is to serve the community.</p>
<button class="btn-primary button-text">Join Us</button>
```

---

## **3. Components**

### **3.1 Buttons**

- **Primary Button**: Use for **main actions** (e.g., "Join Now," "Donate").

  ```html
<button class="btn-primary">Primary Action</button>
```

- **Secondary Button**: Use for **secondary actions** (e.g., "Learn More").

  ```html
<button class="btn-secondary">Secondary Action</button>
```

**Hover/Focus States**:

- Buttons should **scale slightly** (`transform: scale(1.02)`) and **darken** on hover.
- Ensure **focus rings** are visible for keyboard navigation.

---

### **3.2 Cards**

- Use for **content blocks** (e.g., event cards, member profiles).

  ```html
<div class="card">
    <h3>Event Title</h3>
    <p>Event description goes here.</p>
  </div>
```

- **Hover Effect**: Cards should lift slightly (`transform: translateY(-2px)`) and gain a subtle shadow.

---

### **3.3 Navigation**

- Use the `.nav-menu` and `.nav-link` classes for **consistent navigation**.

  ```html
<ul class="nav-menu">
    <li><a href="#" class="nav-link">Home</a></li>
    <li><a href="#" class="nav-link">About</a></li>
  </ul>
```

- **Hover State**: Links should change to `var(--color-rotary-blue-light)` on hover.

---

## **4. Layout and Spacing**

### **4.1 Containers**

- Use the `.container` class for **centered content**:

  ```html
<div class="container">
    <!-- Content here -->
  </div>
```

### **4.2 Grid System**

- Use `.grid-2` or `.grid-3` for **responsive grids**:

  ```html
<div class="grid-2">
    <div>Column 1</div>
    <div>Column 2</div>
  </div>
```

### **4.3 Spacing Utilities**

- Use `.section-padding` for **vertical spacing**:

  ```html
<section class="section-padding">
    <!-- Section content -->
  </section>
```

---

## **5. Animations**

### **5.1 Fade-In**

- Apply to elements that should **fade in smoothly**:

  ```html
<div class="fade-in">Content</div>
```

### **5.2 Pulse**

- Use for **call-to-action buttons** to draw attention:

  ```html
<button class="btn-primary pulse">Donate Now</button>
```

### **5.3 Hover Scale**

- Apply to **interactive elements** (e.g., cards, buttons):

  ```html
<div class="card hover-scale">Hover me!</div>
```

---

## **6. Accessibility**

### **6.1 Contrast**

- Ensure **all text** meets **WCAG AA/AAA contrast ratios** (minimum 4.5:1).
- Use the **official Rotary colors** for buttons and backgrounds.

### **6.2 Keyboard Navigation**

- All interactive elements (buttons, links) must be **keyboard-accessible**.
- Use `:focus-visible` for **visible focus rings**:

  ```css
:focus-visible {
    outline: 2px solid var(--color-ring);
    outline-offset: 2px;
  }
```

### **6.3 High Contrast Mode**

- Test components in **high contrast mode** to ensure readability:

  ```css
@media (prefers-contrast: high) {
    .btn-primary {
      border: 2px solid black;
    }
  }
```

---

## **7. RTL and Arabic Support**

### **7.1 Font Application**

- Apply the `.font-arabic` class to **Arabic text**:

  ```html
<p class="font-arabic">النص بالعربية</p>
```

### **7.2 RTL Layout**

- Use `dir="rtl"` for **right-to-left layouts**:

  ```html
<div dir="rtl">
    <p>هذا نص بالعربية</p>
  </div>
```

- **RTL-Specific Adjustments**:
  - Mirror margins/padding (e.g., `.ml-auto` becomes `.mr-auto`).
  - Ensure **icons and components** are mirrored.

---

## **8. Dark Mode**

### **8.1 Implementation**

- Use the `.theme-dark` class for **manual dark mode toggling**:

  ```html
<body class="theme-dark">
    <!-- Dark mode content -->
  </body>
```

- **Media Query Support**:

  ```css
@media (prefers-color-scheme: dark) {
    :root {
      --color-background: #0f172a;
    }
  }
```

### **8.2 Component Adjustments**

- Buttons, cards, and text should **adapt to dark mode**:

  ```css
.theme-dark .card {
    background-color: var(--color-card);
    border-color: rgba(248, 250, 252, 0.1);
  }
```

---

## **9. Print Styles**

- Use the `.no-print` class to **hide non-essential elements**:

  ```html
<div class="no-print">This won’t print</div>
```

- Ensure **colors and backgrounds** print correctly:

  ```css
@media print {
    .btn-primary {
      -webkit-print-color-adjust: exact;
    }
  }
```

---

## **10. Best Practices**

1. **Consistency**: Always use the **defined classes and variables** (e.g., `--color-primary`, `.btn-primary`).
2. **Testing**: Validate the theme in **light/dark modes**, **RTL layouts**, and **high contrast**.
3. **Documentation**: Comment your code to explain **custom implementations**.
4. **Feedback**: Gather input from **Arabic-speaking users** to refine RTL support.

---

## **11. Troubleshooting**

| Issue                     | Solution                                  |
|---------------------------|-------------------------------------------|
| Colors appear incorrect   | Verify HEX values match the style guide.  |
| Arabic text misaligned   | Ensure `dir="rtl"` and `.font-arabic` are applied. |
| Animations not working   | Check for conflicting CSS transitions.    |
| Dark mode not applying    | Ensure `.theme-dark` is added to `<body>`. |

---

## **12. Resources**

- **Rotary Brand Center**: [brandcenter.rotary.org](https://brandcenter.rotary.org)
- **Tailwind CSS Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **WCAG Guidelines**: [w3.org/WAI/standards-guidelines/wcag](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

### **Final Notes**

This style guide ensures your implementation of the **Rotary Tunis Doyen Club’s theme** is **consistent, accessible, and aligned with Rotary International’s brand**. Use it as a reference for all development work, and update it as the theme evolves.

Would you like to add **specific examples** (e.g., a full page template) or **additional components** (e.g., modals, forms)?
u like to add **specific examples** (e.g., a full page template) or **additional components** (e.g., modals, forms)?
