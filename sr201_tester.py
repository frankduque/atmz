#!/usr/bin/env python3
"""
SR201 Relay Tester
Interactive menu to test all SR201 relay commands
"""

import socket
import time
import sys

class SR201:
    def __init__(self, ip, control_port=6722, config_port=5111):
        self.ip = ip
        self.control_port = control_port
        self.config_port = config_port
        self.timeout = 3
        
    def send_control_command(self, command):
        """Envia comando na porta de CONTROLE (6722)"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            sock.connect((self.ip, self.control_port))
            
            print(f"📤 Enviando: {command}")
            sock.send(command.encode())
            
            # Lê resposta (8 dígitos para status)
            response = sock.recv(1024).decode().strip()
            print(f"📥 Resposta: {response}")
            
            sock.close()
            return response
        except Exception as e:
            print(f"❌ Erro: {e}")
            return None
    
    def send_config_command(self, command):
        """Envia comando na porta de CONFIG (5111)"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            sock.connect((self.ip, self.config_port))
            
            print(f"📤 Enviando: {command}")
            sock.send(command.encode())
            
            response = sock.recv(1024).decode().strip()
            print(f"📥 Resposta: {response}")
            
            sock.close()
            return response
        except Exception as e:
            print(f"❌ Erro: {e}")
            return None
    
    def get_status(self):
        """Consulta status de todos os canais"""
        print("\n🔍 Consultando status...")
        response = self.send_control_command("00")
        
        if response and len(response) >= 8:
            print("\n📊 Status dos canais:")
            for i, status in enumerate(response[:8], 1):
                state = "🟢 ON" if status == '1' else "⚫ OFF"
                print(f"   Canal {i}: {state}")
        
        return response
    
    def turn_on(self, channel):
        """Liga um canal"""
        print(f"\n🔌 Ligando canal {channel}...")
        return self.send_control_command(f"1{channel}")
    
    def turn_off(self, channel):
        """Desliga um canal"""
        print(f"\n🔌 Desligando canal {channel}...")
        return self.send_control_command(f"2{channel}")
    
    def timed_on(self, channel, seconds):
        """Liga por X segundos e depois desliga"""
        print(f"\n⏱️  Ligando canal {channel} por {seconds} segundos...")
        return self.send_control_command(f"1{channel}:{seconds}")
    
    def timed_off(self, channel, seconds):
        """Desliga por X segundos e depois liga"""
        print(f"\n⏱️  Desligando canal {channel} por {seconds} segundos...")
        return self.send_control_command(f"2{channel}:{seconds}")
    
    def flash(self, channel, duration_ms=500):
        """Flash rápido (liga e desliga)"""
        print(f"\n⚡ Flash no canal {channel} ({duration_ms}ms)...")
        self.turn_on(channel)
        time.sleep(duration_ms / 1000)
        return self.turn_off(channel)
    
    def pulse(self, channel, duration_sec=3):
        """Pulso temporizado"""
        print(f"\n⏱️  Pulso no canal {channel} ({duration_sec}s)...")
        self.turn_on(channel)
        time.sleep(duration_sec)
        return self.turn_off(channel)
    
    def blink(self, channel, repeats=5, interval_ms=300):
        """Piscar N vezes"""
        print(f"\n💡 Piscando canal {channel} ({repeats}x, intervalo {interval_ms}ms)...")
        for i in range(repeats):
            print(f"   Piscada {i+1}/{repeats}")
            self.turn_on(channel)
            time.sleep(interval_ms / 2000)
            self.turn_off(channel)
            if i < repeats - 1:
                time.sleep(interval_ms / 1000)
    
    def get_config(self, session_id="12345"):
        """Consulta configuração"""
        print(f"\n⚙️  Consultando configuração (Session ID: {session_id})...")
        response = self.send_config_command(f"#1{session_id};")
        
        if response and response.startswith('>'):
            parts = response[1:-1].split(',')
            if len(parts) >= 10:
                print("\n📋 Configuração atual:")
                print(f"   IP: {parts[0]}")
                print(f"   Máscara: {parts[1]}")
                print(f"   Gateway: {parts[2]}")
                print(f"   Restaurar estado: {'Sim' if parts[4] == '1' else 'Não'}")
                print(f"   Firmware: {parts[5]}")
                print(f"   Device ID: {parts[6][:14]}")
                print(f"   Senha: {parts[6][14:20]}")
                print(f"   DNS: {parts[7]}")
                print(f"   Servidor remoto: {parts[8]}")
                print(f"   Controle remoto: {'Habilitado' if parts[9] == '1' else 'Desabilitado'}")
        
        return response


def print_header():
    """Imprime cabeçalho"""
    print("\n" + "="*60)
    print("🔌 SR201 RELAY TESTER")
    print("="*60)


def print_menu():
    """Imprime menu principal"""
    print("\n📋 MENU PRINCIPAL:")
    print("\n   COMANDOS BÁSICOS:")
    print("   1. Consultar status de todos os canais")
    print("   2. Ligar um canal")
    print("   3. Desligar um canal")
    print("   4. Ligar todos os canais")
    print("   5. Desligar todos os canais")
    print("\n   COMANDOS TEMPORIZADOS:")
    print("   6. Ligar por X segundos (timed on)")
    print("   7. Desligar por X segundos (timed off)")
    print("   8. Flash (pulso rápido)")
    print("   9. Pulso temporizado")
    print("   10. Piscar N vezes")
    print("\n   CONFIGURAÇÃO:")
    print("   11. Consultar configuração do relê")
    print("   12. Alterar IP do relê")
    print("\n   OUTROS:")
    print("   13. Teste de stress (liga/desliga rápido)")
    print("   14. Teste sequencial (todos os canais)")
    print("\n   0. Sair")
    print("\n" + "-"*60)


def main():
    print_header()
    
    # Configuração
    print("\n⚙️  CONFIGURAÇÃO INICIAL")
    ip = input("Digite o IP do SR201 [192.168.1.4]: ").strip() or "192.168.1.4"
    
    relay = SR201(ip)
    
    # Testa conexão
    print("\n🔍 Testando conexão...")
    if relay.get_status():
        print("✅ Conexão estabelecida!")
    else:
        print("❌ Não foi possível conectar. Verifique o IP e tente novamente.")
        return
    
    # Loop principal
    while True:
        print_menu()
        choice = input("Escolha uma opção: ").strip()
        
        if choice == '0':
            print("\n👋 Até logo!")
            break
        
        elif choice == '1':
            relay.get_status()
        
        elif choice == '2':
            channel = input("Canal (1-8): ").strip()
            if channel.isdigit() and 1 <= int(channel) <= 8:
                relay.turn_on(int(channel))
                time.sleep(0.5)
                relay.get_status()
        
        elif choice == '3':
            channel = input("Canal (1-8): ").strip()
            if channel.isdigit() and 1 <= int(channel) <= 8:
                relay.turn_off(int(channel))
                time.sleep(0.5)
                relay.get_status()
        
        elif choice == '4':
            print("\n🔌 Ligando todos os canais...")
            for i in range(1, 9):
                relay.turn_on(i)
                time.sleep(0.2)
            relay.get_status()
        
        elif choice == '5':
            print("\n🔌 Desligando todos os canais...")
            for i in range(1, 9):
                relay.turn_off(i)
                time.sleep(0.2)
            relay.get_status()
        
        elif choice == '6':
            channel = input("Canal (1-8): ").strip()
            seconds = input("Segundos: ").strip()
            if channel.isdigit() and seconds.isdigit():
                relay.timed_on(int(channel), int(seconds))
                print(f"⏳ Aguardando {seconds}s...")
                time.sleep(int(seconds) + 1)
                relay.get_status()
        
        elif choice == '7':
            channel = input("Canal (1-8): ").strip()
            seconds = input("Segundos: ").strip()
            if channel.isdigit() and seconds.isdigit():
                relay.timed_off(int(channel), int(seconds))
                print(f"⏳ Aguardando {seconds}s...")
                time.sleep(int(seconds) + 1)
                relay.get_status()
        
        elif choice == '8':
            channel = input("Canal (1-8): ").strip()
            duration = input("Duração em ms [500]: ").strip() or "500"
            if channel.isdigit() and duration.isdigit():
                relay.flash(int(channel), int(duration))
                relay.get_status()
        
        elif choice == '9':
            channel = input("Canal (1-8): ").strip()
            duration = input("Duração em segundos [3]: ").strip() or "3"
            if channel.isdigit() and duration.isdigit():
                relay.pulse(int(channel), int(duration))
                relay.get_status()
        
        elif choice == '10':
            channel = input("Canal (1-8): ").strip()
            repeats = input("Número de piscadas [5]: ").strip() or "5"
            interval = input("Intervalo em ms [300]: ").strip() or "300"
            if channel.isdigit() and repeats.isdigit() and interval.isdigit():
                relay.blink(int(channel), int(repeats), int(interval))
                relay.get_status()
        
        elif choice == '11':
            relay.get_config()
        
        elif choice == '12':
            print("\n⚠️  ATENÇÃO: Alterar o IP pode desconectar o relê!")
            new_ip = input("Novo IP: ").strip()
            session = input("Session ID [12345]: ").strip() or "12345"
            response = relay.send_config_command(f"#2{session},{new_ip};")
            if response == ">OK;":
                print("✅ IP alterado! Você precisará reconectar com o novo IP.")
        
        elif choice == '13':
            channel = input("Canal para teste (1-8): ").strip()
            cycles = input("Número de ciclos [10]: ").strip() or "10"
            if channel.isdigit() and cycles.isdigit():
                print(f"\n🔥 Teste de stress - {cycles} ciclos...")
                for i in range(int(cycles)):
                    print(f"   Ciclo {i+1}/{cycles}")
                    relay.turn_on(int(channel))
                    time.sleep(0.1)
                    relay.turn_off(int(channel))
                    time.sleep(0.1)
                relay.get_status()
        
        elif choice == '14':
            print("\n🔄 Teste sequencial - todos os canais...")
            for i in range(1, 9):
                print(f"   Testando canal {i}...")
                relay.turn_on(i)
                time.sleep(0.5)
                relay.turn_off(i)
                time.sleep(0.3)
            relay.get_status()
        
        else:
            print("❌ Opção inválida!")
        
        input("\n⏸️  Pressione ENTER para continuar...")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Interrompido pelo usuário. Até logo!")
        sys.exit(0)
