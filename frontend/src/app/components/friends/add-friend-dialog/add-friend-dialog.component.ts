import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-friend-dialog',
  templateUrl: './add-friend-dialog.component.html',
  styleUrls: ['./add-friend-dialog.component.scss']
})
export class AddFriendDialogComponent {
  addFriendForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddFriendDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.addFriendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.maxLength(200)]]
    });
  }

  /**
   * Envoyer l'invitation d'ami
   */
  onSubmit(): void {
    if (this.addFriendForm.valid) {
      const formData = this.addFriendForm.value;
      this.dialogRef.close(formData);
    }
  }

  /**
   * Annuler et fermer le dialogue
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.addFriendForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName === 'email' ? 'L\'email' : 'Le message'} est requis`;
    }
    if (field?.hasError('email')) {
      return 'Veuillez entrer un email valide';
    }
    if (field?.hasError('maxlength')) {
      return 'Le message ne peut pas dépasser 200 caractères';
    }
    return '';
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.addFriendForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }
}