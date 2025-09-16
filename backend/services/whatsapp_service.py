import requests
import json
from django.conf import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class WhatsAppService:
    """
    Serviço para envio de mensagens via WhatsApp usando a API do WhatsApp Business
    Para desenvolvimento, usaremos uma API simulada ou webhook
    """
    
    def __init__(self):
        # Para produção, você deve configurar essas variáveis no settings.py
        self.api_url = getattr(settings, 'WHATSAPP_API_URL', 'https://api.whatsapp.com/send')
        self.access_token = getattr(settings, 'WHATSAPP_ACCESS_TOKEN', '')
        self.phone_number_id = getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', '')
        
    def format_phone_number(self, phone: str) -> str:
        """
        Formata o número de telefone para o padrão internacional
        Remove caracteres especiais e adiciona código do país se necessário
        """
        # Remove todos os caracteres não numéricos
        clean_phone = ''.join(filter(str.isdigit, phone))
        
        # Se não começar com código do país, adiciona o código do Brasil (55)
        if not clean_phone.startswith('55'):
            if clean_phone.startswith('0'):
                clean_phone = '55' + clean_phone[1:]
            else:
                clean_phone = '55' + clean_phone
                
        return clean_phone
    
    def send_message(self, phone_number: str, message: str) -> bool:
        """
        Envia uma mensagem via WhatsApp
        
        Args:
            phone_number: Número de telefone do destinatário
            message: Mensagem a ser enviada
            
        Returns:
            bool: True se a mensagem foi enviada com sucesso, False caso contrário
        """
        try:
            formatted_phone = self.format_phone_number(phone_number)
            
            # Para desenvolvimento, vamos logar detalhadamente a mensagem
            # Em produção, você deve implementar a chamada real para a API do WhatsApp
            logger.info(f"📱 WhatsApp Message to {formatted_phone}: {message}")
            
            # Log detalhado para desenvolvimento
            print(f"\n{'='*60}")
            print(f"🚀 WHATSAPP MESSAGE SIMULATION")
            print(f"{'='*60}")
            print(f"📞 Destinatário: +{formatted_phone}")
            print(f"📅 Data/Hora: {__import__('datetime').datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
            print(f"💬 Mensagem:")
            print(f"{'-'*40}")
            print(message)
            print(f"{'-'*40}")
            print(f"✅ Status: SIMULADO - Mensagem logada com sucesso")
            print(f"ℹ️  Nota: Para envio real, configure WHATSAPP_ACCESS_TOKEN")
            print(f"{'='*60}\n")
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem WhatsApp: {str(e)}")
            return False
    
    def send_service_request_notification(self, provider_phone: str, service_request) -> bool:
        """
        Envia notificação de nova solicitação de serviço para o prestador
        
        Args:
            provider_phone: Telefone do prestador
            service_request: Objeto ServiceRequest
            
        Returns:
            bool: True se enviado com sucesso
        """
        message = f"""🔔 *Nova Solicitação de Serviço!*

📋 *Serviço:* {service_request.title}
🏷️ *Categoria:* {service_request.category.name}
📍 *Local:* {service_request.city}, {service_request.state}
💰 *Orçamento:* R$ {service_request.budget_min or 'N/A'} - R$ {service_request.budget_max or 'N/A'}
⚡ *Prioridade:* {service_request.get_priority_display()}

📝 *Descrição:*
{service_request.description}

📍 *Endereço:*
{service_request.address}

👤 *Cliente:* {service_request.client.get_full_name()}

🌐 Acesse a plataforma para mais detalhes e fazer sua proposta!

---
*Serviço em Casa - Conectando você aos melhores profissionais*"""
        
        return self.send_message(provider_phone, message)
    
    def send_proposal_accepted_notification(self, client_phone: str, service_assignment) -> bool:
        """
        Envia notificação quando uma proposta é aceita
        
        Args:
            client_phone: Telefone do cliente
            service_assignment: Objeto ServiceAssignment
            
        Returns:
            bool: True se enviado com sucesso
        """
        message = f"""✅ *Proposta Aceita!*

🎉 Sua proposta para o serviço "{service_assignment.service_request.title}" foi aceita!

💰 *Valor:* R$ {service_assignment.proposed_price}
📅 *Duração Estimada:* {service_assignment.estimated_duration or 'A definir'}
👤 *Cliente:* {service_assignment.service_request.client.get_full_name()}
📍 *Local:* {service_assignment.service_request.address}

📝 *Observações:*
{service_assignment.notes or 'Nenhuma observação adicional'}

🌐 Acesse a plataforma para gerenciar o serviço!

---
*Serviço em Casa - Conectando você aos melhores profissionais*"""
        
        return self.send_message(client_phone, message)

# Instância global do serviço
whatsapp_service = WhatsAppService()