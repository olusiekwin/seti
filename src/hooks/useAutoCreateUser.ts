import { useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { usersApi } from '@/services/api';

/**
 * Auto-create user in database when wallet connects
 */
export function useAutoCreateUser() {
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (!currentAccount?.address) return;

      try {
        // Try to get user profile
        const response = await usersApi.getProfile(currentAccount.address);
        
        if (response.user) {
          console.log('✅ User exists in database:', currentAccount.address);
        }
      } catch (error: any) {
        // If user doesn't exist (404), create them
        if (error.message?.includes('User not found') || error.message?.includes('404')) {
          console.log('Creating new user in database:', currentAccount.address);
          
          try {
            await usersApi.updateProfile(currentAccount.address, {
              username: `Trader_${currentAccount.address.slice(2, 8)}`,
              // avatar_url and bio can be set later by user
            });
            
            console.log('✅ User created successfully!');
          } catch (createError) {
            console.error('Failed to create user:', createError);
          }
        } else {
          console.error('Error checking user:', error);
        }
      }
    };

    createUserIfNeeded();
  }, [currentAccount?.address]);
}

