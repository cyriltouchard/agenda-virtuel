import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Créer le formulaire d'inscription
    this.registerForm = this.formBuilder.group({
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [
        Validators.required, 
        Validators.minLength(6),
        this.passwordValidator
      ]],
      confirmMotDePasse: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });

    // Récupérer l'URL de retour
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Rediriger si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  /**
   * Validateur personnalisé pour le mot de passe
   */
  passwordValidator(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    
    const passwordValid = hasNumber && hasUpper && hasLower;
    
    return !passwordValid ? { 'passwordStrength': true } : null;
  }

  /**
   * Validateur pour vérifier que les mots de passe correspondent
   */
  passwordMatchValidator(group: AbstractControl): {[key: string]: any} | null {
    const password = group.get('motDePasse');
    const confirmPassword = group.get('confirmMotDePasse');
    
    if (!password || !confirmPassword) return null;
    
    return password.value !== confirmPassword.value ? { 'passwordMismatch': true } : null;
  }

  /**
   * Soumettre le formulaire d'inscription
   */
  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const userData = {
        nom: this.registerForm.value.nom,
        prenom: this.registerForm.value.prenom,
        email: this.registerForm.value.email,
        motDePasse: this.registerForm.value.motDePasse
      };
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          this.notificationService.showSuccess(
            `Bienvenue ${response.utilisateur.prenom} ! Votre compte a été créé avec succès.`
          );
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.isLoading = false;
          const message = error.error?.error || 'Erreur lors de l\'inscription';
          this.notificationService.showError(message);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Marquer tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} est requis`;
    }
    
    if (field?.hasError('email')) {
      return 'Email invalide';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }

    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum ${maxLength} caractères autorisés`;
    }

    if (field?.hasError('passwordStrength')) {
      return 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
    }

    if (fieldName === 'confirmMotDePasse' && this.registerForm.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }
    
    return '';
  }

  /**
   * Obtenir le label d'un champ
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      prenom: 'Prénom',
      nom: 'Nom',
      email: 'Email',
      motDePasse: 'Mot de passe',
      confirmMotDePasse: 'Confirmation du mot de passe'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Vérifier si les mots de passe ne correspondent pas
   */
  hasPasswordMismatch(): boolean {
    const confirmField = this.registerForm.get('confirmMotDePasse');
    return !!(
      confirmField && 
      confirmField.touched && 
      this.registerForm.hasError('passwordMismatch')
    );
  }

  /**
   * Naviguer vers la page de connexion
   */
  goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }

  /**
   * Obtenir la force du mot de passe
   */
  getPasswordStrength(): string {
    const password = this.registerForm.get('motDePasse')?.value;
    if (!password) return '';

    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasNumber, hasUpper, hasLower, hasSpecial].filter(Boolean).length;
    
    if (password.length < 6) return 'weak';
    if (strength <= 2) return 'medium';
    if (strength === 3) return 'strong';
    return 'very-strong';
  }
}