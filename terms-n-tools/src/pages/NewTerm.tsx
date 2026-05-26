import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, FileText, Info, ScanBarcode } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useEquipmentTypes } from '@/hooks/useEquipmentTypes';
import { useTenant } from '@/contexts/TenantContext';

export default function NewTerm() {
  const [equipmentId, setEquipmentId] = useState('');
  const [collaboratorName, setCollaboratorName] = useState('');
  const [analystId, setAnalystId] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [serialSearch, setSerialSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const { data: types = [] } = useEquipmentTypes();
  const { effectiveClientId, isAdmin } = useTenant();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const { data: equipment } = useQuery({
    queryKey: ['equipment-available', effectiveClientId],
    queryFn: async () => {
      let q = supabase.from('equipment').select('*').eq('status', 'disponivel').eq('is_legacy', false).order('brand');
      if (isAdmin && effectiveClientId) q = q.eq('client_id', effectiveClientId);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: analysts } = useQuery({
    queryKey: ['analysts', effectiveClientId],
    queryFn: async () => {
      let q = supabase.from('analysts').select('*');
      if (isAdmin && effectiveClientId) q = q.eq('client_id', effectiveClientId);
      const { data } = await q;
      return data || [];
    },
  });

  const filteredEquipment = equipment?.filter(eq => typeFilter === 'all' || eq.type === typeFilter) || [];
  const selectedEquipment = equipment?.find(e => e.id === equipmentId);
  const selectedAnalyst = analysts?.find(a => a.id === analystId);

  const suggestions = serialSearch.trim().length >= 1
    ? (equipment?.filter(eq => {
        const q = serialSearch.trim().toUpperCase();
        return eq.serial_number.toUpperCase().includes(q) ||
               (eq.patrimony?.toUpperCase().includes(q) ?? false) ||
               eq.brand.toUpperCase().includes(q) ||
               eq.model.toUpperCase().includes(q);
      }).slice(0, 8) ?? [])
    : [];

  const selectSuggestion = (eq: typeof suggestions[0]) => {
    setEquipmentId(eq.id);
    setSerialSearch(eq.serial_number);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEquipment || !selectedAnalyst) throw new Error('Dados incompletos');
      const { data: term, error } = await supabase.from('responsibility_terms').insert({
        equipment_id: selectedEquipment.id,
        equipment_description: `${selectedEquipment.brand} ${selectedEquipment.model} (${selectedEquipment.type})`,
        serial_number: selectedEquipment.serial_number,
        patrimony: selectedEquipment.patrimony,
        collaborator_name: collaboratorName,
        analyst_id: selectedAnalyst.id,
        analyst_name: selectedAnalyst.name,
        ticket_number: ticketNumber,
        status: 'pendente' as const,
        term_text: settings?.term_text || 'Termo de responsabilidade.',
      }).select().single();
      if (error) throw error;
      const { logAudit } = await import('@/lib/audit');
      await logAudit({ action: 'create', entity_type: 'term', entity_id: term?.id, description: `Termo criado para ${collaboratorName} (${selectedEquipment.brand} ${selectedEquipment.model})` });
      return term;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms-all'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-available'] });
      toast({ title: 'Termo criado com sucesso!' });
      navigate('/termos');
    },
    onError: () => toast({ title: 'Erro ao criar termo', variant: 'destructive' }),
  });

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="page-title">Novo Termo</h1>
          <p className="page-description">Preencha os dados para gerar o termo de responsabilidade</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold">Dados do Termo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Equipamento</Label>
              <div className="relative">
                <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  ref={inputRef}
                  value={serialSearch}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSerialSearch(v);
                    setActiveSuggestion(-1);
                    setShowSuggestions(true);
                    const trimmed = v.trim().toLowerCase();
                    if (trimmed) {
                      const match = equipment?.find(eq => eq.serial_number.toLowerCase() === trimmed);
                      if (match) {
                        setEquipmentId(match.id);
                        setShowSuggestions(false);
                        toast({ title: 'Equipamento localizado', description: `${match.brand} ${match.model}` });
                      }
                    } else {
                      setEquipmentId('');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (!showSuggestions || suggestions.length === 0) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveSuggestion(i => Math.min(i + 1, suggestions.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveSuggestion(i => Math.max(i - 1, 0));
                    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
                      e.preventDefault();
                      selectSuggestion(suggestions[activeSuggestion]);
                    } else if (e.key === 'Escape') {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => { if (serialSearch.trim()) setShowSuggestions(true); }}
                  placeholder="Pesquisar / bipar serial do equipamento..."
                  className="pl-9 rounded-xl"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 top-full mt-1 w-full rounded-xl border bg-popover shadow-lg overflow-hidden"
                  >
                    {suggestions.map((eq, i) => (
                      <button
                        key={eq.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); selectSuggestion(eq); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors ${
                          i === activeSuggestion ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'
                        }`}
                      >
                        <span className="font-medium">{eq.serial_number}</span>
                        <span className="text-muted-foreground text-xs truncate">{eq.brand} {eq.model} · {eq.type}{eq.patrimony ? ` · Pat: ${eq.patrimony}` : ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setEquipmentId(''); }}>
                  <SelectTrigger className="w-[160px] rounded-xl">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {types.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={equipmentId} onValueChange={setEquipmentId}>
                  <SelectTrigger className="flex-1 rounded-xl">
                    <SelectValue placeholder="Selecione o equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEquipment.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.brand} {eq.model} — SN: {eq.serial_number}
                      </SelectItem>
                    ))}
                    {filteredEquipment.length === 0 && (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">Nenhum equipamento disponível</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedEquipment && (
              <div className="rounded-xl bg-accent/50 border border-accent p-4 text-sm space-y-1.5">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Detalhes do equipamento</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-semibold text-muted-foreground">Tipo:</span> {selectedEquipment.type}</p>
                  <p><span className="font-semibold text-muted-foreground">Marca:</span> {selectedEquipment.brand} {selectedEquipment.model}</p>
                  <p><span className="font-semibold text-muted-foreground">Série:</span> {selectedEquipment.serial_number}</p>
                  <p><span className="font-semibold text-muted-foreground">Patrimônio:</span> {selectedEquipment.patrimony || '—'}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome do Colaborador</Label>
              <Input value={collaboratorName} onChange={e => setCollaboratorName(e.target.value)} placeholder="Nome completo do colaborador" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Analista Responsável</Label>
              <Select value={analystId} onValueChange={setAnalystId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione o analista" /></SelectTrigger>
                <SelectContent>
                  {analysts?.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Número do Chamado</Label>
              <Input value={ticketNumber} onChange={e => setTicketNumber(e.target.value)} placeholder="Ex: INC-12345" required className="rounded-xl" />
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <Label className="text-[10px] text-muted-foreground mb-2 block font-bold uppercase tracking-wider">Texto do Termo</Label>
              <p className="text-sm whitespace-pre-line text-muted-foreground leading-relaxed">{settings?.term_text || 'Carregando...'}</p>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-md shadow-primary/20 text-sm" disabled={createMutation.isPending || !equipmentId || !analystId || !collaboratorName || !ticketNumber}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Gerar Termo de Responsabilidade
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
