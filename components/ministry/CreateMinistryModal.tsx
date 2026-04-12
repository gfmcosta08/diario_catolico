import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import { palette, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { ensureUniqueMinistrySlug } from '@/lib/ministryCreate';
import type { QueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

const MIN_NAME_LEN = 2;

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: string;
  queryClient: QueryClient;
  /** Chamado após criar, invalidar cache e fechar o modal (ex.: navegar para o ministério). */
  onCreated: (ministryId: string) => void;
};

export function CreateMinistryModal({ visible, onClose, userId, queryClient, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setName('');
    setDescription('');
    setError(null);
    setCreating(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const submit = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Informe o nome do ministério.');
      return;
    }
    if (trimmed.length < MIN_NAME_LEN) {
      setError(`O nome deve ter pelo menos ${MIN_NAME_LEN} caracteres.`);
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const slug = await ensureUniqueMinistrySlug(trimmed);
      const data = await api.createMinistry({
        slug,
        name: trimmed,
        description: description.trim(),
      });
      await queryClient.invalidateQueries({ queryKey: ['my-ministries', userId] });
      reset();
      onClose();
      if (data?.id) onCreated(data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar');
    } finally {
      setCreating(false);
    }
  }, [description, name, onClose, onCreated, queryClient, userId, reset]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle} allowFontScaling>
            Novo ministério
          </Text>
          <AppTextField label="Nome (ex.: Liturgia)" value={name} onChangeText={setName} />
          <AppTextField
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          {error ? (
            <Text style={styles.err} allowFontScaling>
              {error}
            </Text>
          ) : null}
          <View style={styles.modalRow}>
            <AppButton title="Cancelar" variant="outline" onPress={handleClose} />
            <AppButton title="Criar" onPress={submit} loading={creating} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
    marginBottom: spacing.md,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  err: { color: palette.error, marginTop: spacing.sm, fontSize: 14 },
});
