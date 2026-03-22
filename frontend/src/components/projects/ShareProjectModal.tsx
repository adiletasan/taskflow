import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collaborationApi } from '../../api/collaboration';
import type { ProjectMember } from '../../api/collaboration';
import { useAuthStore } from '../../store/authStore';

interface Props {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

const ROLE_LABELS = {
  admin:  { label: 'Админ',     color: '#e5483a' },
  member: { label: 'Участник',  color: '#3b82f6' },
  viewer: { label: 'Читатель',  color: '#9898a0' },
};

export const ShareProjectModal = ({ projectId, projectName, onClose }: Props) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: members = [] } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => collaborationApi.getMembers(projectId).then(r => r.data),
  });

  const handleInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError('');
    try {
      await collaborationApi.invite(projectId, email.trim(), role);
      setSent(true);
      setEmail('');
      setTimeout(() => setSent(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка отправки приглашения');
    } finally {
      setSending(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      const { data } = await collaborationApi.generateLink(projectId);
      const fullUrl = `${window.location.origin}/invite/${data.token}`;
      setInviteLink(fullUrl);
    } catch {}
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = async (userId: string) => {
    await collaborationApi.removeMember(projectId, userId);
    queryClient.invalidateQueries({ queryKey: ['members', projectId] });
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 100,
      }} />

      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 480,
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        zIndex: 101,
        overflow: 'hidden',
        animation: 'fadeUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' }}>
              Поделиться проектом
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              {projectName}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 20, lineHeight: 1,
            padding: 4, borderRadius: 6,
          }}>×</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Invite by email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'block', marginBottom: 10,
            }}>Пригласить по email</label>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                placeholder="email@example.com"
                type="email"
                style={{
                  flex: 1, padding: '9px 12px',
                  borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg-3)', color: 'var(--text)',
                  fontSize: 13, outline: 'none', fontFamily: 'var(--font)',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-light)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />

              {/* Role selector */}
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                style={{
                  padding: '9px 10px', borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-3)', color: 'var(--text-2)',
                  fontSize: 12, outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="member">Участник</option>
                <option value="admin">Админ</option>
                <option value="viewer">Читатель</option>
              </select>

              <button onClick={handleInvite} disabled={!email.trim() || sending} style={{
                padding: '9px 16px', borderRadius: 8,
                background: email.trim() ? 'var(--accent)' : 'var(--bg-4)',
                color: email.trim() ? '#fff' : 'var(--text-3)',
                border: 'none', cursor: email.trim() ? 'pointer' : 'not-allowed',
                fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}>
                {sending ? '...' : sent ? '✓ Отправлено' : 'Пригласить'}
              </button>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6 }}>{error}</p>
            )}
          </div>

          {/* Invite link */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'block', marginBottom: 10,
            }}>Ссылка-приглашение</label>

            {!inviteLink ? (
              <button onClick={handleGenerateLink} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'none', cursor: 'pointer',
                fontSize: 12, color: 'var(--text-2)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span>⊕</span> Создать ссылку
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input readOnly value={inviteLink} style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-3)', color: 'var(--text-3)',
                  fontSize: 12, outline: 'none',
                }} />
                <button onClick={handleCopy} style={{
                  padding: '8px 14px', borderRadius: 8,
                  background: copied ? 'var(--bg-4)' : 'var(--accent)',
                  color: copied ? 'var(--text-2)' : '#fff',
                  border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}>
                  {copied ? '✓ Скопировано' : 'Копировать'}
                </button>
              </div>
            )}
          </div>

          {/* Members list */}
          {members.length > 0 && (
            <div>
              <label style={{
                fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'block', marginBottom: 10,
              }}>Участники · {members.length}</label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {members.map((member: ProjectMember) => (
                  <div key={member.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 10,
                    background: 'var(--bg-3)',
                    border: '1px solid var(--border)',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0,
                    }}>
                      {member.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                        {member.user?.name}
                        {member.user?.id === user?.id && (
                          <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>
                            (вы)
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        {member.user?.email}
                      </p>
                    </div>

                    {/* Role badge */}
                    <div style={{
                      padding: '2px 8px', borderRadius: 99,
                      background: ROLE_LABELS[member.role]?.color + '18',
                      border: `1px solid ${ROLE_LABELS[member.role]?.color}40`,
                      fontSize: 11, fontWeight: 500,
                      color: ROLE_LABELS[member.role]?.color,
                      whiteSpace: 'nowrap',
                    }}>
                      {ROLE_LABELS[member.role]?.label}
                    </div>

                    {/* Remove */}
                    {member.user?.id !== user?.id && (
                      <button
                        onClick={() => handleRemove(member.userId)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-3)', fontSize: 14, padding: 4, borderRadius: 6,
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                      >✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};