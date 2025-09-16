import csv
import pandas as pd
import re
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import ProviderProfile, ServiceCategory
from django.db import transaction
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Carrega prestadores de serviço a partir de arquivos CSV e Excel'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--csv-file',
            type=str,
            default='result.csv',
            help='Caminho para o arquivo CSV com dados dos prestadores'
        )
        parser.add_argument(
            '--excel-file',
            type=str,
            default='prestadores_vale_europeu.xlsx',
            help='Caminho para o arquivo Excel com dados dos prestadores'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Executa sem salvar no banco de dados (apenas mostra o que seria feito)'
        )
    
    def handle(self, *args, **options):
        csv_file = options['csv_file']
        excel_file = options['excel_file']
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Modo DRY RUN - Nenhum dado será salvo no banco'))
        
        # Carregar dados do CSV
        providers_data = []
        
        try:
            self.stdout.write(f'Carregando dados do arquivo CSV: {csv_file}')
            providers_data.extend(self.load_csv_data(csv_file))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Erro ao carregar CSV: {str(e)}'))
        
        try:
            self.stdout.write(f'Carregando dados do arquivo Excel: {excel_file}')
            providers_data.extend(self.load_excel_data(excel_file))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Erro ao carregar Excel: {str(e)}'))
        
        if not providers_data:
            self.stdout.write(self.style.ERROR('Nenhum dado foi carregado dos arquivos'))
            return
        
        self.stdout.write(f'Total de prestadores encontrados: {len(providers_data)}')
        
        # Processar e salvar dados
        if not dry_run:
            self.create_providers(providers_data)
        else:
            self.preview_providers(providers_data)
    
    def load_csv_data(self, file_path):
        """Carrega dados do arquivo CSV"""
        providers = []
        
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                provider_data = self.parse_csv_row(row)
                if provider_data:
                    providers.append(provider_data)
        
        return providers
    
    def load_excel_data(self, file_path):
        """Carrega dados do arquivo Excel"""
        providers = []
        
        try:
            df = pd.read_excel(file_path)
            for _, row in df.iterrows():
                provider_data = self.parse_excel_row(row)
                if provider_data:
                    providers.append(provider_data)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Erro ao ler Excel: {str(e)}'))
        
        return providers
    
    def parse_csv_row(self, row):
        """Processa uma linha do CSV"""
        name = row.get('name', '').strip()
        if not name:
            return None
        
        # Extrair informações
        address = row.get('address', '').strip()
        phone = self.clean_phone(row.get('phone_number', ''))
        website = row.get('website', '').strip()
        rating = self.parse_rating(row.get('reviews_average', '0'))
        reviews_count = self.parse_int(row.get('reviews_count', '0'))
        
        # Determinar categoria baseada no nome/descrição
        category = self.determine_category(name)
        
        # Extrair cidade do endereço
        city = self.extract_city(address)
        
        return {
            'name': name,
            'address': address,
            'phone': phone,
            'website': website,
            'rating': rating,
            'reviews_count': reviews_count,
            'category': category,
            'city': city,
            'source': 'CSV'
        }
    
    def parse_excel_row(self, row):
        """Processa uma linha do Excel"""
        # Como o Excel pode ter estrutura diferente, adaptamos conforme necessário
        # Por enquanto, retornamos None pois o Excel parece estar corrompido
        return None
    
    def clean_phone(self, phone):
        """Limpa e formata número de telefone"""
        if not phone:
            return ''
        
        # Remove caracteres não numéricos exceto +
        phone = re.sub(r'[^\d+]', '', phone)
        
        # Se começa com +55, mantém
        if phone.startswith('+55'):
            return phone
        
        # Se começa com 55 e tem mais de 11 dígitos, adiciona +
        if phone.startswith('55') and len(phone) > 11:
            return '+' + phone
        
        # Se tem 11 dígitos e começa com 9, adiciona código do país
        if len(phone) == 11 and phone.startswith('9'):
            return '+5547' + phone
        
        return phone
    
    def parse_rating(self, rating_str):
        """Converte string de rating para float"""
        try:
            return float(rating_str)
        except (ValueError, TypeError):
            return 0.0
    
    def parse_int(self, int_str):
        """Converte string para int"""
        try:
            return int(float(int_str))
        except (ValueError, TypeError):
            return 0
    
    def determine_category(self, name):
        """Determina a categoria baseada no nome do prestador"""
        name_lower = name.lower()
        
        if any(word in name_lower for word in ['eletric', 'elétric', 'instalações elétricas']):
            return 'Eletricista'
        elif any(word in name_lower for word in ['encanador', 'hidráulica', 'plumber']):
            return 'Encanador'
        elif any(word in name_lower for word in ['pintura', 'pintor', 'painter']):
            return 'Pintor'
        elif any(word in name_lower for word in ['climatização', 'ar condicionado', 'hvac']):
            return 'Técnico em Ar Condicionado'
        elif any(word in name_lower for word in ['reparos', 'marido de aluguel', 'handyman']):
            return 'Serviços Gerais'
        else:
            return 'Outros'
    
    def extract_city(self, address):
        """Extrai cidade do endereço"""
        if not address:
            return ''
        
        # Procura por padrões como "Cidade - Estado"
        match = re.search(r'([A-Za-zÀ-ÿ\s]+)\s*-\s*[A-Z]{2}', address)
        if match:
            city = match.group(1).strip()
            # Remove partes como "Centro", "Vila", etc.
            city_parts = city.split(',')
            if len(city_parts) > 1:
                return city_parts[-1].strip()
            return city
        
        return 'Blumenau'  # Default para a região
    
    def create_providers(self, providers_data):
        """Cria os prestadores no banco de dados"""
        created_count = 0
        updated_count = 0
        error_count = 0
        
        for provider_data in providers_data:
            try:
                with transaction.atomic():
                    # Criar ou buscar categoria
                    category, _ = ServiceCategory.objects.get_or_create(
                        name=provider_data['category'],
                        defaults={'description': f'Serviços de {provider_data["category"]}'}
                    )
                    
                    # Gerar email único baseado no nome
                    email = self.generate_email(provider_data['name'])
                    
                    # Gerar username único baseado no email
                    username = email.split('@')[0]
                    counter = 1
                    original_username = username
                    while User.objects.filter(username=username).exists():
                        username = f'{original_username}_{counter}'
                        counter += 1
                    
                    # Criar ou atualizar usuário
                    user, user_created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            'username': username,
                            'first_name': provider_data['name'].split()[0] if provider_data['name'] else '',
                            'last_name': ' '.join(provider_data['name'].split()[1:]) if len(provider_data['name'].split()) > 1 else '',
                            'user_type': 'provider',
                            'phone_number': provider_data['phone'],
                            'address': provider_data['address'],
                            'city': provider_data['city'],
                            'state': 'SC',  # Assumindo Santa Catarina
                            'is_active': True
                        }
                    )
                    
                    if not user_created:
                        # Atualizar dados se usuário já existe
                        user.phone_number = provider_data['phone'] or user.phone_number
                        user.address = provider_data['address'] or user.address
                        user.city = provider_data['city'] or user.city
                        user.save()
                    
                    # Criar ou atualizar perfil de prestador
                    provider_profile, profile_created = ProviderProfile.objects.get_or_create(
                        user=user,
                        defaults={
                            'bio': f'Prestador de serviços de {provider_data["category"]} em {provider_data["city"]}',
                            'rating': provider_data['rating'],
                            'total_jobs': provider_data['reviews_count'],
                            'is_available': True
                        }
                    )
                    
                    # Adicionar categoria ao perfil
                    provider_profile.service_categories.add(category)
                    
                    if not profile_created:
                        # Atualizar dados se perfil já existe
                        provider_profile.rating = max(provider_profile.rating, provider_data['rating'])
                        provider_profile.total_jobs += provider_data['reviews_count']
                        provider_profile.save()
                        updated_count += 1
                    else:
                        created_count += 1
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ {"Criado" if profile_created else "Atualizado"}: {provider_data["name"]} ({provider_data["category"]})'
                        )
                    )
                    
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f'✗ Erro ao processar {provider_data["name"]}: {str(e)}'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nResumo da importação:\n'
                f'- Criados: {created_count}\n'
                f'- Atualizados: {updated_count}\n'
                f'- Erros: {error_count}\n'
                f'- Total processados: {len(providers_data)}'
            )
        )
    
    def preview_providers(self, providers_data):
        """Mostra preview dos dados que seriam criados"""
        self.stdout.write(self.style.WARNING('\nPreview dos prestadores que seriam criados:'))
        
        categories = {}
        cities = {}
        
        for i, provider in enumerate(providers_data[:10]):  # Mostra apenas os primeiros 10
            self.stdout.write(
                f'{i+1}. {provider["name"]} - {provider["category"]} - {provider["city"]} '
                f'(Rating: {provider["rating"]}, Reviews: {provider["reviews_count"]})'
            )
            
            # Contar categorias e cidades
            categories[provider['category']] = categories.get(provider['category'], 0) + 1
            cities[provider['city']] = cities.get(provider['city'], 0) + 1
        
        if len(providers_data) > 10:
            self.stdout.write(f'... e mais {len(providers_data) - 10} prestadores')
        
        self.stdout.write('\nCategorias encontradas:')
        for category, count in categories.items():
            self.stdout.write(f'- {category}: {count}')
        
        self.stdout.write('\nCidades encontradas:')
        for city, count in cities.items():
            self.stdout.write(f'- {city}: {count}')
    
    def generate_email(self, name):
        """Gera email único baseado no nome"""
        if not name:
            return f'provider_{User.objects.count() + 1}@servicoemcasa.com'
        
        # Remove acentos e caracteres especiais
        import unicodedata
        name_clean = unicodedata.normalize('NFKD', name)
        name_clean = ''.join([c for c in name_clean if not unicodedata.combining(c)])
        name_clean = re.sub(r'[^a-zA-Z0-9\s]', '', name_clean)
        name_clean = re.sub(r'\s+', '.', name_clean.strip().lower())
        
        base_email = f'{name_clean}@servicoemcasa.com'
        
        # Verificar se email já existe
        counter = 1
        email = base_email
        while User.objects.filter(email=email).exists():
            email = f'{name_clean}.{counter}@servicoemcasa.com'
            counter += 1
        
        return email