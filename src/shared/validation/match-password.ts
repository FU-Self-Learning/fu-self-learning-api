import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'MatchPassword', async: false })
export class MatchPassword implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    if (password !== (args.object as any)[args.constraints[0]]) return false;
    return true;
  }

  defaultMessage() {
    return 'Passwords do not match!';
  }
}

@ValidatorConstraint({ name: 'RequirePasswordIfNotPublic', async: false })
export class RequirePasswordIfNotPublic implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    const isPublic = (args.object as any).isPublic;
    if (isPublic === false) {
      return typeof password === 'string' && password.trim().length > 0;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password is required when the study set is not public.';
  }
}
