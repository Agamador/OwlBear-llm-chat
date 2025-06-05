# 🔌 Ejemplo de Servicio Externo

import requests
import json
import time

# Configuración del servidor
SERVER_URL = "http://localhost:3000"

class OBRExternalService:
    def __init__(self):
        self.server_url = SERVER_URL
        
    def get_connected_tabs(self):
        """Obtener todas las pestañas conectadas"""
        try:
            response = requests.get(f"{self.server_url}/tabs")
            if response.status_code == 200:
                return response.json()["tabs"]
            else:
                print(f"❌ Error obteniendo pestañas: {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error conectando al servidor: {e}")
            return []
    
    def execute_action(self, tab_id, action, args):
        """Ejecutar una acción OBR en una pestaña específica"""
        try:
            payload = {
                "action": action,
                "args": args
            }
            
            response = requests.post(
                f"{self.server_url}/execute/{tab_id}",
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                print(f"✅ Acción '{action}' ejecutada en {tab_id}")
                return response.json()
            elif response.status_code == 404:
                print(f"❌ Pestaña {tab_id} no encontrada")
                return None
            else:
                print(f"❌ Error ejecutando acción: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

# Ejemplos de uso
def demo():
    service = OBRExternalService()
    
    print("🚀 Iniciando demo del servicio externo...")
    
    # 1. Obtener pestañas conectadas
    print("\n📋 Obteniendo pestañas conectadas...")
    tabs = service.get_connected_tabs()
    
    if not tabs:
        print("❌ No hay pestañas conectadas. Asegúrate de:")
        print("   1. El servidor está corriendo: npm run server")
        print("   2. El frontend está abierto: npm run dev")
        return
    
    print(f"✅ Pestañas encontradas: {tabs}")
    
    # Usar la primera pestaña disponible
    tab_id = tabs[0]
    print(f"\n🎯 Usando pestaña: {tab_id}")
    
    # 2. Crear formas
    print("\n🔴 Creando círculo rojo...")
    service.execute_action(tab_id, "createShape", [{
        "x": 100,
        "y": 100,
        "width": 80,
        "height": 80,
        "shapeType": "CIRCLE",
        "fillColor": "#ff0000"
    }])
    
    time.sleep(1)
    
    print("🟦 Creando cuadrado azul...")
    service.execute_action(tab_id, "createShape", [{
        "x": 200,
        "y": 100,
        "width": 80,
        "height": 80,
        "shapeType": "RECTANGLE",
        "fillColor": "#0000ff"
    }])
    
    time.sleep(1)
    
    # 3. Crear texto
    print("\n📝 Creando texto...")
    service.execute_action(tab_id, "createText", [
        "¡Hola desde Python!",
        150,
        200,
        {"fontSize": 20, "color": "#000000"}
    ])
    
    print("\n✅ Demo completado!")

# Función para uso interactivo
def interactive_mode():
    service = OBRExternalService()
    
    while True:
        print("\n" + "="*50)
        print("🎮 Servicio Externo OBR - Modo Interactivo")
        print("="*50)
        print("1. Ver pestañas conectadas")
        print("2. Crear forma")
        print("3. Crear texto")
        print("4. Ejecutar demo completo")
        print("0. Salir")
        
        choice = input("\n👉 Selecciona una opción: ")
        
        if choice == "0":
            print("👋 ¡Hasta luego!")
            break
            
        elif choice == "1":
            tabs = service.get_connected_tabs()
            if tabs:
                print(f"📋 Pestañas conectadas: {tabs}")
            else:
                print("❌ No hay pestañas conectadas")
                
        elif choice == "2":
            tabs = service.get_connected_tabs()
            if not tabs:
                print("❌ No hay pestañas conectadas")
                continue
                
            tab_id = tabs[0]
            x = int(input("📍 Coordenada X: ") or "100")
            y = int(input("📍 Coordenada Y: ") or "100")
            color = input("🎨 Color (hex, ej: #ff0000): ") or "#ff0000"
            
            service.execute_action(tab_id, "createShape", [{
                "x": x, "y": y, "width": 80, "height": 80,
                "shapeType": "CIRCLE", "fillColor": color
            }])
            
        elif choice == "3":
            tabs = service.get_connected_tabs()
            if not tabs:
                print("❌ No hay pestañas conectadas")
                continue
                
            tab_id = tabs[0]
            text = input("📝 Texto: ") or "Hola mundo"
            x = int(input("📍 Coordenada X: ") or "100")
            y = int(input("📍 Coordenada Y: ") or "100")
            
            service.execute_action(tab_id, "createText", [text, x, y])
            
        elif choice == "4":
            demo()
            
        else:
            print("❌ Opción no válida")

if __name__ == "__main__":
    print("🐍 Servicio Externo de Python para OBR")
    print("Asegúrate de que el servidor esté corriendo: npm run server\n")
    
    mode = input("¿Modo interactivo? (y/n): ").lower()
    
    if mode == "y" or mode == "yes":
        interactive_mode()
    else:
        demo()
