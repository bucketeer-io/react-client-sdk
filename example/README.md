# Bucketeer React SDK Example

This example demonstrates how to use the Bucketeer React Client SDK in a React application.

## Setup

1. **Configure your Bucketeer credentials**
   
   Edit `src/App.tsx` and update the configuration:
   
   ```tsx
   import { defineBKTConfig, defineBKTUser } from 'bkt-js-client-sdk';
   
   const config = defineBKTConfig({
     apiKey: 'your-actual-api-key',        // Replace with your API key
     apiEndpoint: 'https://api.bucketeer.io', // Your Bucketeer endpoint
     featureTag: 'your-feature-tag',       // Your feature tag
   });
   
   const user = defineBKTUser({
     id: 'user-123',                       // Unique user identifier
     attributes: {
       name: 'John Doe',                   // User attributes
       email: 'john@example.com',
       plan: 'premium',
     },
   });
   ```

2. **Create feature flags in Bucketeer**
   
   This example expects the following feature flags to be configured in your Bucketeer dashboard:
   
   - `new-design-enabled` (Boolean) - Controls whether the new design is shown
   - `welcome-message` (String) - Customizable welcome message
   - `max-items` (Number) - Maximum number of items to display
   - `theme-config` (JSON) - Theme configuration object with `primaryColor` and `fontFamily`

3. **Run the example**
   
   ```bash
   # From the root directory
   yarn build
   yarn example:start
   ```

## Features Demonstrated

- **Provider Setup**: How to configure the BucketeerProvider
- **Boolean Flags**: Conditional UI rendering based on feature flags
- **String Flags**: Dynamic content with string variations
- **Number Flags**: Configurable limits and values
- **Object Flags**: Complex configuration objects
- **Real-time Updates**: Feature flags update automatically when changed
- **User Attributes**: Updating user attributes dynamically

## File Structure

```
example/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx          # Main application with SDK demo
│   └── index.tsx        # React app entry point
├── package.json
└── tsconfig.json
```

## Note

This example uses placeholder configuration. To see real feature flag behavior, you'll need to:

1. Sign up for Bucketeer.io
2. Create a project and get your API credentials
3. Set up the feature flags mentioned above
4. Update the configuration in `App.tsx`
