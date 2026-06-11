import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthForm } from '@/components/auth/AuthForm';
import { ApiError } from '@/lib/api';

describe('AuthForm', () => {
  it('shows a validation error instead of submitting an invalid email', async () => {
    const onSubmit = jest.fn();
    render(<AuthForm mode="login" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'not-an-email');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('valid email');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires a minimum password length on registration', async () => {
    const onSubmit = jest.fn();
    render(<AuthForm mode="register" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Name'), 'Jane');
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('at least 8 characters');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid credentials', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AuthForm mode="login" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'supersecret1');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'supersecret1',
      name: '',
    });
  });

  it('renders API errors returned from the submit handler', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new ApiError(401, 'Invalid email or password'));
    render(<AuthForm mode="login" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });
});
