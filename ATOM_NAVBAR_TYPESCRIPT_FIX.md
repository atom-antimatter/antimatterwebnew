# NavBar TypeScript Build Fix

## Issue

Build was failing with TypeScript error:

```
Type error: Type '{ children: Element[]; className: string; title: string | undefined; href?: undefined; key: string; }' is not assignable to type 'Props'.
  Types of property 'href' are incompatible.
    Type 'undefined' is not assignable to type 'Url'.
```

**Root Cause:**  
The `ItemWrapper` component was being conditionally assigned to either `TransitionLink` or `'div'`, but TypeScript couldn't properly handle the discriminated union where `href` was sometimes `undefined`.

---

## Solution

Created a **proper discriminated union wrapper component** (`ProductItemWrapper`) that TypeScript can properly type-check.

### Key Changes:

1. **Discriminated Union Type**
   ```typescript
   type ProductItemWrapperProps = 
     | { available: true; href: string; className?: string; title?: string; children: React.ReactNode }
     | { available: false; className?: string; title?: string; children: React.ReactNode };
   ```

2. **Conditional Rendering**
   ```typescript
   const ProductItemWrapper: React.FC<ProductItemWrapperProps> = (props) => {
     if (props.available) {
       return <TransitionLink href={props.href}>{props.children}</TransitionLink>;
     }
     
     return <div aria-disabled="true" tabIndex={-1}>{props.children}</div>;
   };
   ```

3. **Call Site Updated**
   ```typescript
   <ProductItemWrapper
     available={product.available}
     {...(product.available ? { href: product.href } : {})}
     // ...
   >
   ```

---

## Why This Works

### Before (Broken):
```typescript
const ItemWrapper = product.available ? TransitionLink : 'div';
const itemProps = product.available ? { href: product.href } : {};

<ItemWrapper {...itemProps} /> // ❌ TypeScript can't properly type this
```

**Problem:**  
- When `ItemWrapper` is `'div'`, spreading an empty object `{}` still results in `href?: undefined`
- TypeScript sees `href: undefined` which is not assignable to `href: Url`

### After (Fixed):
```typescript
<ProductItemWrapper
  available={product.available}
  {...(product.available ? { href: product.href } : {})}
/>
```

**Solution:**  
- Discriminated union on `available` boolean
- TypeScript knows: if `available: true`, then `href` must be `string`
- TypeScript knows: if `available: false`, then `href` must not exist
- Conditional spread ensures `href` is **never passed as `undefined`**

---

## Accessibility Improvements

Added proper ARIA attributes for disabled items:

```typescript
<div
  aria-disabled="true"
  tabIndex={-1}
>
```

This ensures:
- ✅ Screen readers announce item as disabled
- ✅ Keyboard navigation skips disabled items
- ✅ No false affordance of clickability

---

## TypeScript Guarantees

The discriminated union enforces at compile time:

1. **If `available: true`**
   - ✅ `href` must be provided
   - ✅ `href` must be a valid `string` (Url)
   - ✅ Renders as `<TransitionLink>`

2. **If `available: false`**
   - ✅ `href` must NOT be provided (not even as `undefined`)
   - ✅ Renders as `<div>`
   - ✅ Includes `aria-disabled` and `tabIndex={-1}`

---

## Files Modified

```
✅ src/components/NavBar.tsx
  - Added React import for React.FC and React.ReactNode
  - Created ProductItemWrapper discriminated union component
  - Updated AtomAIDropdown to use new wrapper
  - Ensures href is never undefined
```

---

## Build Status

- ✅ TypeScript compilation passes
- ✅ No linter errors
- ✅ Discriminated union properly typed
- ✅ Accessibility attributes added
- ✅ No runtime behavior changes

---

## Pattern for Future Use

This pattern can be reused anywhere you need conditional link/div rendering:

```typescript
type WrapperProps = 
  | { isLink: true; href: string; children: React.ReactNode }
  | { isLink: false; children: React.ReactNode };

const Wrapper: React.FC<WrapperProps> = (props) => {
  if (props.isLink) {
    return <Link href={props.href}>{props.children}</Link>;
  }
  return <div>{props.children}</div>;
};

// Usage:
<Wrapper isLink={condition} {...(condition ? { href: "/path" } : {})}>
  Content
</Wrapper>
```

**Key:** Use a discriminant property (like `available` or `isLink`) to guide TypeScript's type narrowing.

---

*Fixed: December 22, 2025*  
*Build: PASSING ✅*

