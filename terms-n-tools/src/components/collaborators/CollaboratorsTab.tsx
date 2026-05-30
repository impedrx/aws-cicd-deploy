import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Users, Pencil, Eye, Monitor, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { EQUIPMENT_STATUS } from '@/lib/constants';
import { useCollaborators, normalizeName, type Collaborator } from '@/hooks/useCollaborators';
import { RenameCollaboratorDialog } from './RenameCollaboratorDialog';

const termStatusLabel: Record<string, string> = {
  pendente: 'Pendente',
  enviado_para_assinatura: 'Enviado',
  fechado: 'Fechado',
  cancelado: 'Cancelado',
};

export function CollaboratorsTab() {
  const { data: collaborators = [], isLoading } = useCollaborators();
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Collaborator | null>(null);
  const [renaming, setRenaming] = useState<Collaborator | null>(null);

  const filtered = useMemo(() => {
    const q = normalizeName(search);
    if (!q) return collaborators;
    return collaborators.filter((c) => c.key.includes(q));
  }, [collaborators, search]);

  return (
    <div className="space-y-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input placeholder="Buscar colaborador..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 rounded-xl bg-card" />
      </div>

      <p className="text-xs text-muted-foreground font-medium">
        {filtered.length} colaborador{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      <div className="pro-table">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colaborador</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Equipamentos em posse</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Termos</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm">Carregando...</span>
                </div>
              </TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-10 w-10 text-muted-foreground/20" />
                  <span className="text-sm font-medium">Nenhum colaborador encontrado</span>
                </div>
              </TableCell></TableRow>
            ) : filtered.map((c, i) => (
              <TableRow key={c.key} className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}>
                <TableCell className="font-medium text-sm">{c.displayName}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[11px] font-semibold">{c.equipmentCount}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[11px] font-semibold">{c.termCount}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" onClick={() => setDetail(c)} title="Ver detalhes" className="h-8 w-8 rounded-lg hover:bg-primary/10"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setRenaming(c)} title="Editar / Consolidar nome" className="h-8 w-8 rounded-lg hover:bg-primary/10"><Pencil className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />{detail.displayName}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => { setRenaming(detail); setDetail(null); }} className="rounded-xl gap-1.5">
                    <Pencil className="h-3.5 w-3.5" /> Editar / Consolidar nome
                  </Button>
                </div>

                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Monitor className="h-3.5 w-3.5" /> Equipamentos em posse ({detail.heldEquipment.length})
                  </h3>
                  {detail.heldEquipment.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">Nenhum equipamento atribuído a esta pessoa.</p>
                  ) : (
                    <div className="rounded-xl border divide-y">
                      {detail.heldEquipment.map((e) => {
                        const st = EQUIPMENT_STATUS.find((s) => s.value === e.status);
                        return (
                          <div key={e.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{e.brand} {e.model} <span className="text-muted-foreground font-normal">· {e.type}</span></p>
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{e.serial_number}</code>
                            </div>
                            <Badge variant="secondary" className={`${st?.color} text-primary-foreground text-[11px] font-semibold flex-shrink-0`}>{st?.label}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Termos ({detail.terms.length})
                  </h3>
                  {detail.terms.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">Nenhum termo gerado.</p>
                  ) : (
                    <div className="rounded-xl border divide-y">
                      {detail.terms.map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{t.equipment_description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{t.ticket_number}</code>
                              <span>{format(new Date(t.created_at), 'dd/MM/yyyy')}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[11px] font-semibold flex-shrink-0">{termStatusLabel[t.status] || t.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {renaming && (
        <RenameCollaboratorDialog collaborator={renaming} all={collaborators} onClose={() => setRenaming(null)} />
      )}
    </div>
  );
}
