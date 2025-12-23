# Professional Linear Navigation System

## 🚀 Overview

A comprehensive, developer-friendly linear navigation system built with modern React patterns and professional UX principles. This system provides step-by-step navigation with smart validation, state management, and accessibility features.

## ✨ Key Features

### 🎯 **Smart Navigation Flow**
- **Sequential Navigation**: Guided step-by-step progression
- **Smart Validation**: Built-in validation with custom rules
- **State Persistence**: Auto-save progress to localStorage
- **History Management**: Navigate backward through history
- **Skip Functionality**: Optional steps with skip capability

### 🎨 **Professional Design**
- **Multiple Variants**: Default, minimal, cards, timeline styles
- **Responsive Design**: Mobile-first approach with breakpoints
- **Smooth Animations**: 60fps transitions and micro-interactions
- **Accessibility**: Full keyboard navigation and screen reader support
- **Dark Mode**: Automatic dark mode detection and support

### 🔧 **Developer Experience**
- **TypeScript Ready**: Full type definitions (can be added)
- **Flexible API**: Highly customizable with sensible defaults
- **Hook-based**: Modern React patterns with custom hooks
- **Validation System**: Powerful validation with custom rules
- **Event System**: Comprehensive callback system

## 📦 Components

### 1. **LinearNavigation**
Core navigation component with breadcrumbs and progress tracking.

```jsx
import { LinearNavigation } from './components/Navigation';

const steps = [
  {
    id: 'step-1',
    title: 'Welcome',
    subtitle: 'Getting started',
    component: WelcomeStep,
    icon: FiHome
  },
  // ... more steps
];

<LinearNavigation
  items={steps}
  currentStep={0}
  onStepChange={(step) => console.log('Step:', step)}
  showProgress={true}
  showBreadcrumbs={true}
  allowSkip={false}
  orientation="horizontal"
  variant="default"
/>
```

### 2. **NavigationWizard**
Complete wizard implementation with validation and form handling.

```jsx
import { NavigationWizard } from './components/Navigation';

<NavigationWizard
  steps={wizardSteps}
  title="Setup Wizard"
  subtitle="Complete setup in a few steps"
  onComplete={(data) => console.log('Completed:', data)}
  onCancel={() => console.log('Cancelled')}
  allowSkip={true}
  showProgress={true}
  autoSave={true}
/>
```

### 3. **useLinearNavigation Hook**
Powerful state management hook for custom implementations.

```jsx
import { useLinearNavigation } from './hooks/useLinearNavigation';

const {
  currentStep,
  completedSteps,
  visitedSteps,
  stepData,
  progress,
  navigateToStep,
  goNext,
  goBack,
  updateStepData,
  validateStep,
  reset
} = useLinearNavigation({
  steps,
  initialStep: 0,
  autoSave: true,
  onComplete: (data) => console.log('Done:', data)
});
```

## 🎨 Style Variants

### **Default**
Clean, professional design with gradients and shadows.

### **Minimal**
Simplified design with reduced visual elements.

### **Cards**
Card-based layout with elevated elements.

### **Timeline**
Vertical timeline design with connecting lines.

## 🔧 Configuration Options

### **LinearNavigation Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | `[]` | Array of step configurations |
| `currentStep` | `number` | `0` | Current active step index |
| `onStepChange` | `function` | - | Callback when step changes |
| `showProgress` | `boolean` | `true` | Show progress bar |
| `showBreadcrumbs` | `boolean` | `true` | Show step breadcrumbs |
| `allowSkip` | `boolean` | `false` | Allow skipping steps |
| `orientation` | `string` | `'horizontal'` | Layout orientation |
| `variant` | `string` | `'default'` | Visual style variant |

### **Step Configuration**

```jsx
const step = {
  id: 'unique-id',              // Unique identifier
  title: 'Step Title',          // Display title
  subtitle: 'Step subtitle',    // Optional subtitle
  description: 'Description',   // Detailed description
  component: StepComponent,     // React component
  icon: IconComponent,          // Icon component
  validation: validatorFn,      // Validation function
  isOptional: false,           // Optional step flag
  isDisabled: false,           // Disabled step flag
  props: {}                    // Additional props
};
```

## 🔍 Validation System

### **Built-in Validators**

```jsx
import { createValidator, validationPatterns } from './navigationUtils';

const validator = createValidator({
  email: {
    required: true,
    pattern: validationPatterns.email,
    message: 'Valid email required'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: validationPatterns.strongPassword
  },
  confirmPassword: {
    required: true,
    custom: (value, data) => value === data.password,
    message: 'Passwords must match'
  }
});
```

### **Validation Patterns**

- `email`: Email address validation
- `phone`: Phone number validation
- `url`: URL validation
- `alphanumeric`: Letters and numbers only
- `username`: Username format (3-20 chars)
- `strongPassword`: Strong password requirements

### **Custom Validation**

```jsx
const customValidator = (data, stepIndex) => {
  // Custom validation logic
  if (!data.customField) {
    return {
      isValid: false,
      message: 'Custom field is required',
      errors: { customField: 'This field is required' }
    };
  }
  
  return { isValid: true };
};
```

## 🎯 Advanced Usage

### **Form Integration**

```jsx
const FormStep = ({ stepData, onUpdateData, onComplete }) => {
  const [formData, setFormData] = useState(stepData || {});
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validator(formData);
    
    if (validation.isValid) {
      onUpdateData(formData);
      onComplete(formData);
    } else {
      setErrors(validation.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### **State Persistence**

```jsx
// Automatic persistence
const navigation = useLinearNavigation({
  steps,
  autoSave: true,
  storageKey: 'my-wizard-state'
});

// Manual persistence
import { saveNavigationState, loadNavigationState } from './navigationUtils';

saveNavigationState('key', navigationState);
const savedState = loadNavigationState('key');
```

### **URL Synchronization**

```jsx
import { syncWithURL, getStepFromURL } from './navigationUtils';

// Sync current step with URL
useEffect(() => {
  syncWithURL(currentStep, steps, history);
}, [currentStep]);

// Get initial step from URL
const initialStep = getStepFromURL(steps);
```

### **Keyboard Navigation**

```jsx
import { handleKeyboardNavigation } from './navigationUtils';

useEffect(() => {
  const handleKeyDown = (e) => {
    handleKeyboardNavigation(e, navigation);
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [navigation]);
```

## 🎨 Customization

### **Custom Themes**

```css
:root {
  --primary-color: #10b981;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #333333;
  --color-textSecondary: #666666;
  --color-hover: #f0f2f5;
  --border-color: #e4e6eb;
}
```

### **Custom Animations**

```css
.linear-navigation[data-direction="forward"] .navigation-content {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

## 📱 Responsive Design

### **Breakpoints**

- **Mobile**: ≤ 768px
- **Tablet**: 769px - 1024px  
- **Desktop**: ≥ 1025px

### **Mobile Optimizations**

- Touch-friendly controls
- Simplified breadcrumbs
- Stacked layout
- Larger tap targets
- Swipe gestures (optional)

## ♿ Accessibility

### **Keyboard Navigation**

- `Arrow Keys`: Navigate between steps
- `Enter/Space`: Activate current step
- `Home/End`: Jump to first/last step
- `Tab`: Focus navigation elements

### **Screen Reader Support**

- Proper ARIA labels
- Step status announcements
- Progress updates
- Error announcements

### **Focus Management**

- Visible focus indicators
- Logical tab order
- Focus restoration
- Skip links

## 🔧 Performance

### **Optimizations**

- Lazy loading of step components
- Memoized calculations
- Efficient re-renders
- Hardware acceleration
- Bundle splitting

### **Best Practices**

```jsx
// Lazy load step components
const LazyStep = React.lazy(() => import('./StepComponent'));

// Memoize expensive calculations
const progress = useMemo(() => 
  calculateProgress(currentStep, steps.length, completedSteps),
  [currentStep, steps.length, completedSteps]
);

// Optimize re-renders
const MemoizedStep = React.memo(StepComponent);
```

## 🧪 Testing

### **Unit Tests**

```jsx
import { render, fireEvent, screen } from '@testing-library/react';
import { LinearNavigation } from './LinearNavigation';

test('navigates to next step', () => {
  render(<LinearNavigation items={mockSteps} />);
  
  fireEvent.click(screen.getByText('Next'));
  
  expect(screen.getByText('Step 2')).toBeInTheDocument();
});
```

### **Integration Tests**

```jsx
test('completes full wizard flow', async () => {
  const onComplete = jest.fn();
  render(<NavigationWizard steps={mockSteps} onComplete={onComplete} />);
  
  // Navigate through all steps
  for (let i = 0; i < mockSteps.length; i++) {
    fireEvent.click(screen.getByText('Next'));
  }
  
  expect(onComplete).toHaveBeenCalledWith(expectedData);
});
```

## 📚 Examples

### **Basic Setup Wizard**

```jsx
const SetupWizard = () => {
  const steps = [
    {
      id: 'welcome',
      title: 'Welcome',
      component: WelcomeStep
    },
    {
      id: 'account',
      title: 'Account',
      component: AccountStep,
      validation: accountValidator
    },
    {
      id: 'preferences',
      title: 'Preferences',
      component: PreferencesStep,
      isOptional: true
    }
  ];

  return (
    <NavigationWizard
      steps={steps}
      title="Setup Wizard"
      onComplete={handleComplete}
    />
  );
};
```

### **Custom Navigation**

```jsx
const CustomNavigation = () => {
  const navigation = useLinearNavigation({
    steps: customSteps,
    autoSave: true,
    onStepChange: handleStepChange
  });

  return (
    <div className="custom-navigation">
      <CustomProgressBar progress={navigation.progress} />
      <CustomBreadcrumbs navigation={navigation} />
      <CustomStepContent navigation={navigation} />
      <CustomControls navigation={navigation} />
    </div>
  );
};
```

## 🚀 Getting Started

1. **Install dependencies** (if using as separate package)
2. **Import components**:
   ```jsx
   import { LinearNavigation, NavigationWizard, useLinearNavigation } from './components/Navigation';
   ```
3. **Define your steps**:
   ```jsx
   const steps = [/* your step configurations */];
   ```
4. **Implement step components**:
   ```jsx
   const MyStep = ({ stepData, onComplete }) => {
     // Your step implementation
   };
   ```
5. **Add navigation to your app**:
   ```jsx
   <NavigationWizard steps={steps} onComplete={handleComplete} />
   ```

## 🤝 Contributing

1. Follow the established patterns
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test across devices and browsers

## 📄 License

This navigation system is part of the Nexus ChatApp project and follows the same licensing terms.

---

**Built with ❤️ for modern React applications**