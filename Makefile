build:
	docker compose build

run:
	docker compose up -d

stop:
	docker compose down

restart:
	docker compose down
	docker compose up -d

logs:
	docker compose logs -f

ps:
	docker compose ps

clean:
	docker compose down -v

rebuild:
	docker compose build --no-cache
	docker compose up -d